<template>

<div class="page">


    <header class="topbar">


        <nav class="nav-container">


            <div class="nav-items">


                <router-link to="/projects">

                    Projects

                </router-link>


                <router-link to="/labs">

                    Labs

                </router-link>


                <router-link to="/tools">

                    Tools

                </router-link>


            </div>


        </nav>


    </header>






    <main class="page-content">


        <router-view />


    </main>



</div>

</template>