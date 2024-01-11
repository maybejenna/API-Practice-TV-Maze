"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await fetch(`http://api.tvmaze.com/search/shows?q=${encodeURIComponent(term)}`);
  const showsData = await response.json();

  return showsData.map(item => {
    const show = item.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : 'https://tinyurl.com/tv-missing'
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


async function getEpisodesOfShow(id) {
  const response = await fetch(`http://api.tvmaze.com/shows/${id}/episodes`);
  const episodes = await response.json();

  return episodes.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
}

function populateEpisodes(episodes, showName) {
  const $episodesListModal = $('#episodesListModal');
  const $episodesModalTitle = $('#episodesModalLabel');

  $episodesListModal.empty();
  $episodesModalTitle.text(`${showName} Episode List`);

  for (let episode of episodes) {
    const $item = $('<li>').text(`${episode.name} (season ${episode.season}, number ${episode.number})`);
    $episodesListModal.append($item);
  }

  $('#episodesModal').modal('show');
}

$showsList.on('click', '.Show-getEpisodes', async function () {
  const showId = $(this).closest('.Show').data('show-id');
  const showName = $(this).closest('.media-body').find('h5.text-primary').text();
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes, showName);
});

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});
