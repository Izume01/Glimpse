(function() {
    const script = document.currentScript 
    if (!script) return;

    const projectId  = script.getAttribute('data-project-id');
    if (!projectId) return;

    // expose later if needed

})();