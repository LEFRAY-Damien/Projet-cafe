<?php

namespace App\Command;

use App\Entity\Categorie;
use App\Entity\Produit;
use App\Entity\Image;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:seed:cafe',
    description: 'Ajoute des catégories/produits/images de démo en base (DEV).'
)]
class AppSeedCafeCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // Catégories
        $catBoissons = (new Categorie())->setNom('Boissons');
        $catViennoiseries = (new Categorie())->setNom('Viennoiseries');

        $this->em->persist($catBoissons);
        $this->em->persist($catViennoiseries);

        // Produits
        $cafe = (new Produit())
            ->setNom('Café')
            ->setPrix(2.50)
            ->setDescription('Café chaud fraîchement préparé.')
            ->setCategorie($catBoissons);

        $croissant = (new Produit())
            ->setNom('Croissant')
            ->setPrix(1.20)
            ->setDescription('Croissant croustillant.')
            ->setCategorie($catViennoiseries);

        $this->em->persist($cafe);
        $this->em->persist($croissant);

        // Images (si tu as une entité Image liée au Produit)
        $imgCafe = (new Image())
            ->setUrl('https://picsum.photos/seed/cafe/600/400')
            ->setProduit($cafe);

        $imgCroissant = (new Image())
            ->setUrl('https://picsum.photos/seed/croissant/600/400')
            ->setProduit($croissant);

        $this->em->persist($imgCafe);
        $this->em->persist($imgCroissant);

        $this->em->flush();

        $output->writeln('<info>Seed OK : catégories + produits + images ajoutés.</info>');

        return Command::SUCCESS;
    }
}
