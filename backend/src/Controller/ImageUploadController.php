<?php

namespace App\Controller;

use App\Entity\Image;
use App\Entity\Produit;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class ImageUploadController
{
    #[Route('/api/images/upload', name: 'api_images_upload', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function __invoke(
        Request $request,
        EntityManagerInterface $em,
        #[Autowire('%uploads_dir%')] string $uploads_dir
    ): JsonResponse {
        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');
        $produitIri = (string) $request->request->get('produit'); // ex: /api/produits/1
        $alt = $request->request->get('alt');

        if (!$file) {
            return new JsonResponse(['detail' => 'Le fichier "file" est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        if ($file->getSize() > 2 * 1024 * 1024) { // 2 Mo
            return new JsonResponse(['detail' => 'Fichier trop volumineux (max 2 Mo).'], Response::HTTP_BAD_REQUEST);
        }

        if (!$produitIri) {
            return new JsonResponse(['detail' => 'Le champ "produit" (IRI) est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        // ✅ extrait l'id depuis /api/produits/{id}
        if (!preg_match('#/api/produits/(\d+)#', $produitIri, $m)) {
            return new JsonResponse(
                ['detail' => 'IRI produit invalide. Exemple attendu : /api/produits/1'],
                Response::HTTP_BAD_REQUEST
            );
        }
        $produitId = (int) $m[1];

        $produit = $em->getRepository(Produit::class)->find($produitId);
        if (!$produit) {
            return new JsonResponse(['detail' => 'Produit introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Sécurité basique : MIME image/*
        $mime = (string) $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return new JsonResponse(
                ['detail' => 'Format non autorisé. Fichier image attendu (jpg/png/gif/webp...).'],
                Response::HTTP_UNSUPPORTED_MEDIA_TYPE
            );
        }

        // Nom de fichier unique (conserve extension)
        $ext = $file->guessExtension() ?: 'bin';
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array(strtolower($ext), $allowed, true)) {
            return new JsonResponse(
                ['detail' => 'Extension non autorisée (jpg/jpeg/png/gif/webp).'],
                Response::HTTP_UNSUPPORTED_MEDIA_TYPE
            );
        }

        $filename = uniqid('img_', true) . '.' . $ext;

        // Déplacement dans public/uploads
        $file->move($uploads_dir, $filename);

        // Crée l'entité Image (on stocke un chemin local dans url)
        $image = new Image();
        $image->setUrl('/uploads/' . $filename);
        $image->setAlt($alt ? (string) $alt : null);
        $image->setProduit($produit);

        $em->persist($image);
        $em->flush();

        return new JsonResponse([
            '@id' => '/api/images/' . $image->getId(),
            'id' => $image->getId(),
            'url' => $image->getUrl(),
            'alt' => $image->getAlt(),
            'produit' => $produitIri,
        ], Response::HTTP_CREATED);
    }
}
