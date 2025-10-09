const videoFeedContainer = document.getElementById('peer-video-feeds');
const scrollAmount = 300;
const arrowsLeftBtn = document.getElementById(
  'arrow-left'
) as HTMLButtonElement;
const arrowsRightBtn = document.getElementById(
  'arrow-right'
) as HTMLButtonElement;
arrowsLeftBtn.addEventListener('click', () => {
  videoFeedContainer?.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});
arrowsRightBtn.addEventListener('click', () => {
  videoFeedContainer?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});
