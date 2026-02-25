-- Insert contestants into the database
INSERT INTO public.contestants (name, category, bio) VALUES
-- Miss YIBS
('Mambo Annabel Awah', 'miss', 'Department: SWE BTECH'),
('Chuhmboin Vanella', 'miss', 'Department: CGWD'),
('Ayamba Marilyn Ojong', 'miss', 'Department: Midwifery'),
('Kenne Ange', 'miss', 'Department: ISN BTECH'),
('Arrey Delma Eteng', 'miss', 'Department: Network & Security'),
('Enow Che Precious', 'miss', 'Department: '),
('Mekinda Esther', 'miss', 'Department: Nursing'),
('Essola Bingono Staicy', 'miss', 'Department: Nursing'),
('Yikoni Nyuymengka', 'miss', 'Department: Fashion Clothing and Textile'),

-- Master YIBS
('Fonkem Randy', 'master', 'Department: CGWD'),
('Maloh Malvine-Joy', 'master', 'Department: Accountancy'),
('Djenou Jason Muluh Afeseh', 'master', 'Department: CGWD'),
('Metala Justin Angel', 'master', 'Department: Marketing Trade Sales')
ON CONFLICT DO NOTHING;
