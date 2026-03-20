-- Produits (alimenté par Open Food Facts)
create table produits (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  nom_normalise text,           -- ex: "lait demi ecreme"
  code_barre text unique,
  categorie text,
  marque text,
  image_url text,
  created_at timestamp default now()
);

-- Magasins
create table magasins (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  enseigne text not null,       -- "Carrefour", "Lidl", "Leclerc"...
  adresse text,
  latitude float,
  longitude float,
  google_place_id text unique,
  created_at timestamp default now()
);

-- Prix (mis à jour chaque semaine par le script Python)
create table prix (
  id uuid default gen_random_uuid() primary key,
  produit_id uuid references produits(id),
  magasin_id uuid references magasins(id),
  prix_normal float not null,
  prix_promo float,
  est_en_promo boolean default false,
  date_fin_promo date,
  source text,                  -- "drive", "catalogue", "utilisateur"
  mis_a_jour_le timestamp default now(),
  unique(produit_id, magasin_id)
);

-- Liste de courses (stockée localement + sync optionnelle)
create table listes (
  id uuid default gen_random_uuid() primary key,
  user_id text,                 -- identifiant local ou auth
  nom text default 'Ma liste',
  created_at timestamp default now()
);

create table liste_items (
  id uuid default gen_random_uuid() primary key,
  liste_id uuid references listes(id) on delete cascade,
  produit_nom text not null,    -- ce que l'utilisateur a tapé
  produit_id uuid references produits(id), -- résolu si trouvé
  quantite int default 1,
  est_fait boolean default false,
  created_at timestamp default now()
);
