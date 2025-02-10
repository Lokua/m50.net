document.addEventListener('DOMContentLoaded', startPrevNextKeyboardListeners)

function startPrevNextKeyboardListeners() {
  const previousLinkButton = document.getElementById('prev-playlist-link')
  const nextButtonLink = document.getElementById('next-playlist-link')

  document.addEventListener('keydown', (e) => {
    console.log('keydown', e)
    if (e.altKey && e.key === 'ArrowLeft' && previousLinkButton) {
      console.log('left', e)
      e.preventDefault()
      previousLinkButton.click()
    } else if (e.altKey && e.key === 'ArrowRight' && nextButtonLink) {
      console.log('right', e)
      e.preventDefault()
      nextButtonLink.click()
    }
  })
}
