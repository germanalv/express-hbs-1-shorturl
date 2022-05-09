console.log("Hola soy el Fonrtend");

document.addEventListener('click', e => {
    // console.log(e.target.dataset.short);

    if (e.target.dataset.short) {
        const url = `${window.location.origin}/${e.target.dataset.short}`;

        navigator.clipboard
            .writeText(url)
            .then(() => {
                console.log("Text copied to clipboard...");
            })
            .catch((err) => {
                console.log("Something went wrong", err);
            });
    }


})