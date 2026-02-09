<template>
    <div class="home-bg d-flex align-items-center justify-content-center text-white">
        <div class="home-overlay"></div>
        <div class="home-content container text-center">

            <div class="container py-4">
                <h1 class="h3 mb-3">Administration</h1>

                <ul class="nav nav-pills mb-3 flex-wrap gap-2">
                    <li class="nav-item">
                        <RouterLink class="nav-link" active-class="active" to="/admin/produits">Produits</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" active-class="active" to="/admin/categories">Catégories
                        </RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" active-class="active" to="/admin/commandes">Commandes</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" active-class="active" to="/admin/users">Users</RouterLink>
                    </li>
                </ul>

                <RouterView />
            </div>

        </div>
    </div>
</template>
