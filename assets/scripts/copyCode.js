// This assumes that you're using Rouge; if not, update the selector
// const codeBlocks = document.querySelectorAll('.code-header + .highlighter-rouge');
const codeBlocks = document.querySelectorAll('div.highlight');
const copyCodeButtons = document.querySelectorAll('.copy-code-button');

codeBlocks.forEach((codeBlock) => {
  const copyButton = document.createElement('button');
  copyButton.className = 'copy';
  copyButton.type = 'button';
  copyButton.ariaLabel = 'Copy code to clipboard';
  copyButton.innerText = 'Copy';

  codeBlock.append(copyButton);

  copyButton.addEventListener('click', function () {
    const code = codeBlock.querySelector('code').innerText.trim();
    window.navigator.clipboard.writeText(code);

    copyButton.innerText = 'Copied';
    const fourSeconds = 4000;

    setTimeout(function () {
      copyButton.innerText = 'Copy';
    }, fourSeconds);
  });
});
