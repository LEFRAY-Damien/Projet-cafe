<?php

namespace App\Tests\Functional;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

class ApiSecurityTest extends ApiTestCase
{
    // Compatible API Platform 4+ (évite le warning)
    protected static ?bool $alwaysBootKernel = true;

    /**
     * L'API Platform démarre correctement
     */
    public function testApiEntrypointIsAccessible(): void
    {
        static::createClient()->request('GET', '/api');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame(
            'content-type',
            'application/ld+json; charset=utf-8'
        );
    }

    /**
     * Les commandes de l'utilisateur nécessitent une authentification
     */
    public function testMeCommandesRequiresAuthentication(): void
    {
        static::createClient()->request('GET', '/api/me/commandes');

        $this->assertResponseStatusCodeSame(401);
    }

    /**
     * Les commandes admin sont protégées
     */
    public function testAdminCommandesIsForbiddenForAnonymous(): void
    {
        static::createClient()->request('GET', '/api/admin/commandes');

        $status = static::getClient()->getResponse()->getStatusCode();

        // Selon config sécurité : 401 (non connecté) ou 403 (interdit)
        $this->assertTrue(
            in_array($status, [401, 403], true),
            'Attendu 401 ou 403 pour un accès anonyme à /api/admin/commandes'
        );
    }
}