-- Ajouter les colonnes manquantes à la table listes
alter table listes add column if not exists is_template boolean default false;
alter table listes add column if not exists archived boolean default false;
alter table listes add column if not exists semaine_du date;
