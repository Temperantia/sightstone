<script lang="ts">
  import _ from "lodash";
  import championData from "$lib/champion.json";

  export let game: any;

  $: teams = _.values(_.groupBy(game.participants, "team_key"));

  const findChampionName = (championId: number) => {
    return Object.values(championData.data).find(
      ({ key }) => key === championId.toString()
    )?.id;
  };
</script>

<div class="flex flex-col items-center w-80">
  <div class="my-5 font-bold text-center">Ranked Solo/Duo</div>
  <div class="flex items-center border border-grey-light-1">
    <div>
      {#each teams[0] as participant}
        <div class="flex items-center justify-end">
          <a
            target="_blank"
            href={"https://twitch.tv/" + participant.stream}
            class="text-sm"
            class:text-purple={participant.stream}
          >
            {participant.summoner.name}
          </a>
          <img
            class="m-2"
            style="width: 24px; height: 24px"
            src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
              findChampionName(participant.champion_id) +
              ".png"}
            alt="osef"
          />
        </div>
      {/each}
    </div>
    <div>
      {#each teams[1] as participant}
        <div class="flex items-center justify-start">
          <img
            class="m-2"
            style="width: 24px; height: 24px"
            src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
              findChampionName(participant.champion_id) +
              ".png"}
            alt="osef"
          />
          <a
            target="_blank"
            href={"https://twitch.tv/" + participant.stream}
            class="text-sm"
            class:text-purple={participant.stream}
          >
            {participant.summoner.name}
          </a>
        </div>
      {/each}
    </div>
  </div>
</div>
