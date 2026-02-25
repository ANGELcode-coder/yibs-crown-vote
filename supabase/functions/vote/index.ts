import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action, phone_number, otp_code, contestant_id, category } =
      await req.json();

    // ACTION: request_otp
    if (action === "request_otp") {
      if (!phone_number || typeof phone_number !== "string") {
        return new Response(
          JSON.stringify({ error: "Phone number is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanPhone = phone_number.replace(/[^0-9+]/g, "");
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        return new Response(
          JSON.stringify({ error: "Invalid phone number format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate 6-digit OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      // Upsert voter record
      const { error } = await supabase
        .from("voters")
        .upsert(
          {
            phone_number: cleanPhone,
            otp_code: otp,
            verified: false,
            otp_expires_at: expiresAt,
          },
          { onConflict: "phone_number" }
        );

      if (error) {
        console.error("Upsert error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to generate OTP" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // In production, send SMS via Twilio/etc. For demo, return OTP
      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP sent to your phone",
          // DEMO ONLY - remove in production
          demo_otp: otp,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: verify_and_vote
    if (action === "verify_and_vote") {
      if (!phone_number || !otp_code || !contestant_id || !category) {
        return new Response(
          JSON.stringify({ error: "All fields are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!["miss", "master"].includes(category)) {
        return new Response(
          JSON.stringify({ error: "Invalid category" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanPhone = phone_number.replace(/[^0-9+]/g, "");

      // Get voter
      const { data: voter, error: voterError } = await supabase
        .from("voters")
        .select("*")
        .eq("phone_number", cleanPhone)
        .single();

      if (voterError || !voter) {
        return new Response(
          JSON.stringify({ error: "Please request an OTP first" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check OTP
      if (voter.otp_code !== otp_code) {
        return new Response(
          JSON.stringify({ error: "Invalid OTP code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check expiry
      if (new Date(voter.otp_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "OTP has expired. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify voter
      await supabase
        .from("voters")
        .update({ verified: true, otp_code: null })
        .eq("id", voter.id);

      // Check if already voted in this category
      const { data: existingVote } = await supabase
        .from("votes")
        .select("id")
        .eq("voter_id", voter.id)
        .eq("category", category)
        .single();

      if (existingVote) {
        return new Response(
          JSON.stringify({
            error: `You have already voted in the ${category} category`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify contestant exists and matches category
      const { data: contestant } = await supabase
        .from("contestants")
        .select("id, category")
        .eq("id", contestant_id)
        .eq("category", category)
        .single();

      if (!contestant) {
        return new Response(
          JSON.stringify({ error: "Invalid contestant for this category" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Cast vote
      const { error: voteError } = await supabase.from("votes").insert({
        voter_id: voter.id,
        contestant_id,
        category,
      });

      if (voteError) {
        console.error("Vote error:", voteError);
        return new Response(
          JSON.stringify({ error: "Failed to cast vote. You may have already voted." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Vote cast successfully!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: get_results
    if (action === "get_results") {
      const { data: votes } = await supabase
        .from("votes")
        .select("contestant_id");

      const counts: Record<string, number> = {};
      if (votes) {
        for (const v of votes) {
          counts[v.contestant_id] = (counts[v.contestant_id] || 0) + 1;
        }
      }

      return new Response(
        JSON.stringify({ results: counts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: check_vote_status
    if (action === "check_vote_status") {
      if (!phone_number) {
        return new Response(
          JSON.stringify({ error: "Phone number required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanPhone = phone_number.replace(/[^0-9+]/g, "");
      const { data: voter } = await supabase
        .from("voters")
        .select("id")
        .eq("phone_number", cleanPhone)
        .single();

      if (!voter) {
        return new Response(
          JSON.stringify({ voted_miss: false, voted_master: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: votes } = await supabase
        .from("votes")
        .select("category")
        .eq("voter_id", voter.id);

      const categories = votes?.map((v) => v.category) || [];
      return new Response(
        JSON.stringify({
          voted_miss: categories.includes("miss"),
          voted_master: categories.includes("master"),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
