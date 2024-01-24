<script lang="ts">
  import rq from '$lib/rq/rq.svelte';
</script>

<div class="flex-grow flex items-center justify-center">
  <a href={rq.getKakaoLoginUrl()} class="btn">
    <i class="fa-solid fa-comment text-[color:#ffe812]"></i>
    카카오로 3초만에 시작하기
  </a>
</div>
