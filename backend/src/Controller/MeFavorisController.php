<?php

namespace App\Controller;

use App\Entity\Produit;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('IS_AUTHENTICATED_FULLY')]
class MeFavorisController extends AbstractController
{
    #[Route('/api/me/favoris', name: 'me_favoris_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $items = [];
        foreach ($user->getFavoris() as $p) {
            $items[] = '/api/produits/' . $p->getId();
        }

        return $this->json(['items' => $items]);
    }

    #[Route('/api/me/favoris/{id}', name: 'me_favoris_add', methods: ['POST'])]
    public function add(Produit $produit, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $user->addFavori($produit);
        $em->flush();

        return $this->json(['ok' => true], 201);
    }

    #[Route('/api/me/favoris/{id}', name: 'me_favoris_remove', methods: ['DELETE'])]
    public function remove(Produit $produit, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $user->removeFavori($produit);
        $em->flush();

        return $this->json(['ok' => true]);
    }
}
