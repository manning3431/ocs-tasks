import './bootstrap';

if (import.meta.hot) {
  import.meta.hot.accept('./bootstrap', () => {
    // HMR handled by bootstrap
  });
}