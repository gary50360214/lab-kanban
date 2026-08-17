<template>

<main class="home-page">


<section class="home-hero">


    <div class="home-hero-content">


        <h1>
            ND2A33 Lab Center
        </h1>

        <p>
            Internal Laboratory Management Platform
        </p>



        <div class="home-hero-actions">


            <router-link
                class="home-hero-button"
                to="/projects"
            >
                Explore Projects
            </router-link>


        </div>


    </div>


</section>






<section class="home-feature-section">


    <div class="home-feature-grid">



        <div class="home-feature-card">


            <h2>
                Projects
            </h2>


            <p>
                Manage project progress and workflow.
            </p>



            <router-link
                class="home-feature-button"
                to="/projects"
            >
                Explore
            </router-link>


        </div>







        <div class="home-feature-card">


            <h2>
                Labs
            </h2>


            <p>
                View laboratory information.
            </p>



            <router-link
                class="home-feature-button"
                to="/labs"
            >
                Explore
            </router-link>


        </div>







        <div class="home-feature-card">


            <h2>
                Tools
            </h2>


            <p>
                Internal engineering utilities.
            </p>



            <router-link
                class="home-feature-button"
                to="/tools"
            >
                Explore
            </router-link>


        </div>



    </div>


</section>



</main>

</template>