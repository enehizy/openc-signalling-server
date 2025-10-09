const key = 'DISPLAY_NAME';

export function getDisplayName(): string | null {
  return localStorage.getItem(key) || null;
}
export function setDisplayName(name: string): void {
  localStorage.setItem(key, name);
}
const overlay = document.getElementById('overlay') as HTMLDivElement;
const displayName = document.getElementById(
  'display-name'
) as HTMLHeadingElement;
const joinBtn = document.getElementById('join-btn') as HTMLButtonElement;
document.addEventListener('DOMContentLoaded', () => {
  const name = getDisplayName();
  if (name) {
    overlay.classList.add('hidden');
    displayName.textContent = name;
    return;
  }
});
joinBtn.addEventListener('click', () => {
  const nameInput = document.getElementById('name-input') as HTMLInputElement;
  const name = nameInput.value.trim();
  setDisplayName(name);
  displayName.textContent = name;
  overlay.classList.add('hidden');
});
