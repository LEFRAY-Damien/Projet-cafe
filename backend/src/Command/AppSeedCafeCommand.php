<?php

namespace App\Command;

use App\Entity\Categorie;
use App\Entity\Produit;
use App\Entity\Image;
use App\Entity\User;
use App\Entity\Commande;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:seed:cafe',
    description: 'Ajoute des catégories/produits/images/users/commandes de démo en base (DEV).'
)]
class AppSeedCafeCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $hasher
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // =========================
        // 1) CATÉGORIES
        // =========================
        $catBoissons      = $this->getOrCreateCategorie('Boissons');
        $catViennoiseries = $this->getOrCreateCategorie('Viennoiseries');
        $catDesserts      = $this->getOrCreateCategorie('Desserts');
        $catSandwichs     = $this->getOrCreateCategorie('Sandwichs');

        // =========================
        // 2) PRODUITS
        // =========================
        $pCafe = $this->getOrCreateProduit(
            nom: 'Café Espresso',
            description: 'Café chaud, intense et aromatique.',
            prix: 2.50,
            disponible: true,
            categorie: $catBoissons
        );

        $pLatte = $this->getOrCreateProduit(
            nom: 'Café Latte',
            description: 'Café doux avec lait chaud et mousse.',
            prix: 3.20,
            disponible: true,
            categorie: $catBoissons
        );

        $pChoco = $this->getOrCreateProduit(
            nom: 'Chocolat chaud',
            description: 'Chocolat onctueux, idéal l’hiver.',
            prix: 3.40,
            disponible: true,
            categorie: $catBoissons
        );

        $pCroissant = $this->getOrCreateProduit(
            nom: 'Croissant',
            description: 'Croissant pur beurre, croustillant.',
            prix: 1.20,
            disponible: true,
            categorie: $catViennoiseries
        );

        $pPainChoco = $this->getOrCreateProduit(
            nom: 'Pain au chocolat',
            description: 'Viennoiserie chocolat, pur beurre.',
            prix: 1.40,
            disponible: true,
            categorie: $catViennoiseries
        );

        $pTarte = $this->getOrCreateProduit(
            nom: 'Tarte aux pommes',
            description: 'Tarte maison, pommes caramélisées.',
            prix: 3.90,
            disponible: true,
            categorie: $catDesserts
        );

        $pCookie = $this->getOrCreateProduit(
            nom: 'Cookie chocolat',
            description: 'Cookie moelleux aux pépites de chocolat.',
            prix: 2.10,
            disponible: false, // exemple produit non dispo
            categorie: $catDesserts
        );

        $pJambon = $this->getOrCreateProduit(
            nom: 'Sandwich jambon-beurre',
            description: 'Classique français, jambon & beurre demi-sel.',
            prix: 5.50,
            disponible: true,
            categorie: $catSandwichs
        );

        // =========================
        // 3) IMAGES
        // =========================
        $this->getOrCreateImage(
            url: 'https://picsum.photos/seed/espresso/800/600',
            alt: 'Café espresso',
            produit: $pCafe
        );

        $this->getOrCreateImage(
            url: 'https://picsum.photos/seed/latte/800/600',
            alt: 'Café latte',
            produit: $pLatte
        );

        $this->getOrCreateImage(
            url: 'https://picsum.photos/seed/choco/800/600',
            alt: 'Chocolat chaud',
            produit: $pChoco
        );

        $this->getOrCreateImage(
            url: 'https://picsum.photos/seed/croissant/800/600',
            alt: 'Croissant',
            produit: $pCroissant
        );

        $this->getOrCreateImage(
            url: 'https://picsum.photos/seed/painchoco/800/600',
            alt: 'Pain au chocolat',
            produit: $pPainChoco
        );

        $this->getOrCreateImage(
            url: 'https://picsum.photos/seed/tarte/800/600',
            alt: 'Tarte aux pommes',
            produit: $pTarte
        );

        $this->getOrCreateImage(
            url: 'https://picsum.photos/seed/sandwich/800/600',
            alt: 'Sandwich jambon-beurre',
            produit: $pJambon
        );

        // =========================
        // 4) USERS
        // =========================
        // Admin
        $admin = $this->getOrCreateUser(
            email: 'admin@cafe.test',
            passwordPlain: 'admin123',
            roles: ['ROLE_ADMIN'],
            nom: 'Admin',
            prenom: 'Café',
            whatsapp: null,
            isActive: true
        );

        // Users
        $u1 = $this->getOrCreateUser(
            email: 'client1@cafe.test',
            passwordPlain: 'client123',
            roles: ['ROLE_USER'],
            nom: 'Dupont',
            prenom: 'Marie',
            whatsapp: '+33600000001',
            isActive: true
        );

        $u2 = $this->getOrCreateUser(
            email: 'client2@cafe.test',
            passwordPlain: 'client123',
            roles: ['ROLE_USER'],
            nom: 'Martin',
            prenom: 'Lucas',
            whatsapp: '+33600000002',
            isActive: true
        );

        $u3 = $this->getOrCreateUser(
            email: 'inactive@cafe.test',
            passwordPlain: 'client123',
            roles: ['ROLE_USER'],
            nom: 'Durand',
            prenom: 'Camille',
            whatsapp: '+33600000003',
            isActive: false
        );

        // =========================
        // 5) COMMANDES
        // =========================
        // ⚠️ Ton CommandeProcessor gère le user en POST normal,
        // mais ici on seed directement en base => on setUser() nous-mêmes.
        $this->getOrCreateCommande(
            user: $u1,
            statut: 'EN_ATTENTE',
            dateCommande: new \DateTimeImmutable('-1 day'),
            dateRetrait: new \DateTime('tomorrow')
        );

        $this->getOrCreateCommande(
            user: $u1,
            statut: 'PRETE',
            dateCommande: new \DateTimeImmutable('now'),
            dateRetrait: new \DateTime('+2 days')
        );

        $this->getOrCreateCommande(
            user: $u2,
            statut: 'ANNULEE',
            dateCommande: new \DateTimeImmutable('-3 days'),
            dateRetrait: new \DateTime('-1 day')
        );

        $this->getOrCreateCommande(
            user: $admin,
            statut: 'EN_ATTENTE',
            dateCommande: new \DateTimeImmutable('now'),
            dateRetrait: new \DateTime('+1 day')
        );

        // =========================
        // FLUSH
        // =========================
        $this->em->flush();

        $output->writeln('<info>Seed OK :</info>');
        $output->writeln('- Catégories : Boissons, Viennoiseries, Desserts, Sandwichs');
        $output->writeln('- Produits : 8');
        $output->writeln('- Images : 7');
        $output->writeln('- Users : admin + 3 clients (dont 1 inactif)');
        $output->writeln('- Commandes : 4');

        $output->writeln('');
        $output->writeln('<comment>Comptes de test :</comment>');
        $output->writeln('ADMIN  : admin@cafe.test / admin123');
        $output->writeln('CLIENT : client1@cafe.test / client123');
        $output->writeln('CLIENT : client2@cafe.test / client123');

        return Command::SUCCESS;
    }

    // =========================================================
    // Helpers (pour éviter doublons si tu relances la commande)
    // =========================================================

    private function getOrCreateCategorie(string $nom): Categorie
    {
        $repo = $this->em->getRepository(Categorie::class);
        $existing = $repo->findOneBy(['nom' => $nom]);
        if ($existing) return $existing;

        $cat = (new Categorie())->setNom($nom);
        $this->em->persist($cat);

        return $cat;
    }

    private function getOrCreateProduit(
        string $nom,
        string $description,
        float $prix,
        bool $disponible,
        Categorie $categorie
    ): Produit {
        $repo = $this->em->getRepository(Produit::class);
        $existing = $repo->findOneBy(['nom' => $nom]);
        if ($existing) {
            // On met à jour si tu relances la commande
            $existing
                ->setDescription($description)
                ->setPrix($prix)
                ->setDisponible($disponible)
                ->setCategorie($categorie);

            return $existing;
        }

        $p = (new Produit())
            ->setNom($nom)
            ->setDescription($description)
            ->setPrix($prix)
            ->setDisponible($disponible)
            ->setCategorie($categorie);

        $this->em->persist($p);

        return $p;
    }

    private function getOrCreateImage(string $url, ?string $alt, Produit $produit): Image
    {
        $repo = $this->em->getRepository(Image::class);

        // une image est unique par (url + produit) dans ce seed
        $existing = $repo->findOneBy(['url' => $url, 'produit' => $produit]);
        if ($existing) {
            $existing->setAlt($alt);
            return $existing;
        }

        $img = (new Image())
            ->setUrl($url)
            ->setAlt($alt)
            ->setProduit($produit);

        $this->em->persist($img);

        return $img;
    }

    private function getOrCreateUser(
        string $email,
        string $passwordPlain,
        array $roles,
        string $nom,
        string $prenom,
        ?string $whatsapp,
        bool $isActive
    ): User {
        $repo = $this->em->getRepository(User::class);
        $existing = $repo->findOneBy(['email' => $email]);
        if ($existing) {
            // update "admin visible fields"
            $existing
                ->setRoles($roles)
                ->setNom($nom)
                ->setPrenom($prenom)
                ->setWhatsapp($whatsapp)
                ->setIsActive($isActive);

            // Option : si tu veux aussi réécrire le mdp à chaque seed, dé-commente :
            // $existing->setPassword($this->hasher->hashPassword($existing, $passwordPlain));

            return $existing;
        }

        $u = (new User())
            ->setEmail($email)
            ->setRoles($roles)
            ->setNom($nom)
            ->setPrenom($prenom)
            ->setWhatsapp($whatsapp)
            ->setIsActive($isActive);

        $u->setPassword($this->hasher->hashPassword($u, $passwordPlain));

        $this->em->persist($u);

        return $u;
    }

    private function getOrCreateCommande(
        User $user,
        string $statut,
        \DateTimeImmutable $dateCommande,
        \DateTime $dateRetrait
    ): Commande {
        $repo = $this->em->getRepository(Commande::class);

        // On évite de dupliquer en se basant sur (user + dateCommande + statut)
        $existing = $repo->findOneBy([
            'user' => $user,
            'dateCommande' => $dateCommande,
            'statut' => $statut,
        ]);

        if ($existing) {
            $existing->setDateRetrait($dateRetrait);
            return $existing;
        }

        $cmd = (new Commande())
            ->setUser($user)
            ->setStatut($statut)
            ->setDateCommande($dateCommande)
            ->setDateRetrait($dateRetrait);

        $this->em->persist($cmd);

        return $cmd;
    }
}
