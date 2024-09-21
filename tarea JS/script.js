// Selección de elementos HTML
const pokemonList = document.getElementById('pokemonList'); // Contenedor para mostrar la lista de Pokémon
const prevBtn = document.getElementById('prevBtn'); // Botón para ir a la página anterior
const nextBtn = document.getElementById('nextBtn'); // Botón para ir a la página siguiente
const searchInput = document.getElementById('searchInput'); // Campo de entrada para buscar Pokémon por nombre o ID
const typeSelect = document.getElementById('typeSelect'); // Menú desplegable para seleccionar el tipo de Pokémon
const pokemonModal = document.getElementById('pokemonModal'); // Modal para mostrar la descripción del Pokémon
const pokemonDescription = document.getElementById('pokemonDescription'); // Contenedor para la descripción del Pokémon en el modal

// Variables para controlar la paginación
let offset = 0; // Desplazamiento inicial de la lista de Pokémon (para la paginación)
const limit = 20; // Límite de Pokémon que se muestran por página

// Función asíncrona para obtener datos desde la API (cualquier URL)
const fetchPokemon = async (url) => {
    const response = await fetch(url); // Realiza una solicitud fetch a la URL proporcionada
    if (!response.ok) { // Si la respuesta no es correcta, lanza un error
        throw new Error('Network response was not ok');
    }
    const data = await response.json(); // Convierte la respuesta a JSON
    return data; // Devuelve los datos JSON
};

// Función para obtener los tipos de Pokémon desde la API
const fetchTypes = async () => {
    const data = await fetchPokemon('https://pokeapi.co/api/v2/type/'); // Obtiene los tipos desde la API de Pokémon
    return data.results; // Devuelve los resultados con los tipos de Pokémon
};

// Función para renderizar la lista de Pokémon en el DOM
const renderPokemon = async (url) => {
    try {
        const data = await fetchPokemon(url); // Obtiene la lista de Pokémon desde la API
        pokemonList.innerHTML = ''; // Limpia el contenedor de Pokémon antes de renderizar

        // Itera sobre los resultados de Pokémon obtenidos
        for (const pokemon of data.results) {
            const pokeData = await fetchPokemon(pokemon.url); // Obtiene los datos de cada Pokémon individual

            // Crea la tarjeta de presentación de cada Pokémon
            const card = `
                <div class="col-md-3">
                    <div class="card" onclick="showPokemonDescription(${pokeData.id})"> <!-- Al hacer clic, muestra la descripción del Pokémon -->
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeData.id}.png" class="card-img-top" alt="${pokeData.name}">
                        <div class="card-body">
                            <h5 class="card-title">${pokeData.name}</h5> <!-- Muestra el nombre del Pokémon -->
                            <p class="card-text">ID: ${pokeData.id}</p> <!-- Muestra el ID del Pokémon -->
                        </div>
                    </div>
                </div>
            `;
            pokemonList.innerHTML += card; // Añade la tarjeta al contenedor de Pokémon
        }
    } catch (error) {
        console.error('Error fetching Pokémon:', error); // Si hay un error, lo muestra en la consola
        pokemonList.innerHTML = '<p>No se pudo cargar la información de los Pokémon.</p>'; // Mensaje de error en el DOM
    }
};

// Función para mostrar la descripción de un Pokémon en el modal
const showPokemonDescription = async (id) => {
    try {
        const pokemonData = await fetchPokemon(`https://pokeapi.co/api/v2/pokemon/${id}/`); // Obtiene los datos del Pokémon por ID
        const speciesData = await fetchPokemon(`https://pokeapi.co/api/v2/pokemon-species/${id}/`); // Obtiene información adicional (especie) del Pokémon
        const types = pokemonData.types.map(typeInfo => typeInfo.type.name).join(', '); // Obtiene los tipos del Pokémon y los convierte en una cadena separada por comas

        // Rellena el modal con la información del Pokémon
        pokemonDescription.innerHTML = `
            <h5>${pokemonData.name}</h5> <!-- Muestra el nombre del Pokémon -->
            <p>ID: ${pokemonData.id}</p> <!-- Muestra el ID del Pokémon -->
            <p class="types">Tipos: ${types}</p> <!-- Muestra los tipos del Pokémon -->
            <p>Descripción: ${speciesData.flavor_text_entries.find(entry => entry.language.name === 'es').flavor_text}</p> <!-- Muestra la descripción del Pokémon en español -->
        `;

        $('#pokemonModal').modal('show'); // Muestra el modal utilizando jQuery
    } catch (error) {
        console.error('Error fetching Pokémon description:', error); // Si hay un error, lo muestra en la consola
        pokemonDescription.innerHTML = '<p>No se pudo cargar la descripción del Pokémon.</p>'; // Mensaje de error en el DOM
    }
};

// Función para renderizar Pokémon filtrados por tipo
const renderPokemonByType = async (type) => {
    try {
        if (type) { // Si se ha seleccionado un tipo de Pokémon
            const data = await fetchPokemon(`https://pokeapi.co/api/v2/type/${type}/`); // Obtiene los Pokémon de ese tipo
            const pokemonUrls = data.pokemon.map(pokemon => pokemon.pokemon.url); // Obtiene las URLs de cada Pokémon del tipo seleccionado
            pokemonList.innerHTML = ''; // Limpia el contenedor de Pokémon

            // Itera sobre las URLs obtenidas y renderiza cada Pokémon
            for (const url of pokemonUrls) {
                const pokeData = await fetchPokemon(url); // Obtiene los datos de cada Pokémon

                // Crea la tarjeta de presentación de cada Pokémon
                const card = `
                    <div class="col-md-3">
                        <div class="card" onclick="showPokemonDescription(${pokeData.id})">
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeData.id}.png" class="card-img-top" alt="${pokeData.name}">
                            <div class="card-body">
                                <h5 class="card-title">${pokeData.name}</h5> <!-- Muestra el nombre del Pokémon -->
                                <p class="card-text">ID: ${pokeData.id}</p> <!-- Muestra el ID del Pokémon -->
                            </div>
                        </div>
                    </div>
                `;
                pokemonList.innerHTML += card; // Añade la tarjeta al contenedor de Pokémon
            }
        } else {
            // Si no se ha seleccionado ningún tipo, muestra la lista general de Pokémon
            renderPokemon(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        }
    } catch (error) {
        console.error('Error fetching Pokémon by type:', error); // Si hay un error, lo muestra en la consola
        pokemonList.innerHTML = '<p>No se pudo cargar la información de los Pokémon.</p>'; // Mensaje de error en el DOM
    }
};

// Función para inicializar los tipos en el menú desplegable
const initTypes = async () => {
    try {
        const types = await fetchTypes(); // Obtiene los tipos de Pokémon desde la API
        typeSelect.innerHTML += types.map(type => `<option value="${type.name}">${type.name}</option>`).join(''); // Añade los tipos al menú desplegable
    } catch (error) {
        console.error('Error fetching Pokémon types:', error); // Si hay un error, lo muestra en la consola
    }
};

// Función para buscar un Pokémon por nombre o ID
const searchPokemon = async (name) => {
    try {
        const data = await fetchPokemon(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`); // Busca un Pokémon por nombre o ID
        // Crea la tarjeta de presentación del Pokémon buscado
        pokemonList.innerHTML = `
            <div class="col-md-3">
                <div class="card" onclick="showPokemonDescription(${data.id})">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png" class="card-img-top" alt="${data.name}">
                    <div class="card-body">
                        <h5 class="card-title">${data.name}</h5> <!-- Muestra el nombre del Pokémon -->
                        <p class="card-text">ID: ${data.id}</p> <!-- Muestra el ID del Pokémon -->
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error searching Pokémon by name:', error); // Si hay un error, lo muestra en la consola
        pokemonList.innerHTML = '<p>No se encontró el Pokémon.</p>'; // Mensaje de error en el DOM
    }
};

// Escucha el evento de la barra de búsqueda para buscar Pokémon al presionar "Enter"
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchPokemon(searchInput.value); // Llama a la función de búsqueda con el valor ingresado
    }
});

// Escucha el evento del menú desplegable para filtrar Pokémon por tipo
typeSelect.addEventListener('change', (e) => {
    const selectedType = e.target.value; // Obtiene el tipo seleccionado
    renderPokemonByType(selectedType); // Llama a la función para renderizar Pokémon por tipo
});

// Escucha el evento del botón "Anterior" para cambiar de página
prevBtn.addEventListener('click', () => {
    if (offset > 0) { // Si no está en la primera página
        offset -= limit; // Disminuye el desplazamiento
        renderPokemon(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`); // Renderiza la página anterior
    }
});

// Escucha el evento del botón "Siguiente" para cambiar de página
nextBtn.addEventListener('click', () => {
    offset += limit; // Aumenta el desplazamiento
    renderPokemon(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`); // Renderiza la página siguiente
});

// Inicializa el menú de tipos y carga los primeros Pokémon
initTypes(); // Inicializa los tipos en el menú desplegable
renderPokemon(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`); // Muestra los primeros 20 Pokémon
