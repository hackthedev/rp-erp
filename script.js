let lager = JSON.parse(localStorage.getItem('lager')) || [];
let rezepte = JSON.parse(localStorage.getItem('rezepte')) || [];

function artikelHinzufügen(artikelObj = null) {
    const artikelName = document.getElementById('artikelName').value;
    const anzahl = parseInt(document.getElementById('anzahl').value);
    const gewicht = parseFloat(document.getElementById('gewicht').value);

    let artikel = { artikelName, anzahl, gewicht };

    if(artikelObj != null){
        lager.push(artikelObj);
    }
    else{
        lager.push(artikel);
    }

    lagerSpeichern();
    lagerAnzeigen();
    felderLeeren();
}

function artikelHerstellen(rezept){
    Object.keys(rezept.rezeptArtikel).forEach(function(artikel) {        
        let articleObj = rezept.rezeptArtikel[artikel];   
        let articleStock = artikelBestand(articleObj.artikelName);
        let index = lager.findIndex(artikel => artikel.artikelName === articleObj.artikelName);
        artikelÄndern(index, "count", articleStock-articleObj.anzahl)
    });

    // Wenn es den Artikel aus dem Rezept nicht gib, erstelle ihn
    const lagerArtikel = lager.find(artikel => artikel.artikelName === rezept.rezeptName);
    if(lagerArtikel == null){
        const artikelName = rezept.rezeptName;
        const anzahl = 1;
        const gewicht = 1;
        artikelHinzufügen({ artikelName, anzahl, gewicht })
    }
    else{
        let index = lager.findIndex(artikel => artikel.artikelName === rezept.rezeptName);
        let articleStock = artikelBestand(rezept.rezeptName);
        artikelÄndern(index, "count", articleStock+1)
    }
}

function artikelBestand(item){
    const lagerArtikel = lager.find(artikel => artikel.artikelName === item);
    return lagerArtikel.anzahl;
}

function artikelÄndern(index, type, value = null) {
    if (type == "count") {
        
        let neueAnzahl;
        if(value != null){
            neueAnzahl = value;
        }
        else{
            neueAnzahl = prompt("Neue Anzahl eingeben:");;
        }


        if (neueAnzahl !== null && !isNaN(neueAnzahl)) {
            lager[index].anzahl = parseInt(neueAnzahl);
            lagerSpeichern();
            lagerAnzeigen();
        }
    } else if (type == "weight") {
        let neueAnzahl;
        if(value != null){
            neueAnzahl = value;
        }
        else{
            neueAnzahl = prompt("Neues Gewicht eingeben:");
        }

        if (neueAnzahl !== null && !isNaN(neueAnzahl)) {
            lager[index].gewicht = parseInt(neueAnzahl);
            lagerSpeichern();
            lagerAnzeigen();
        }
    } else if (type == "delete") {
        let askDelete;
        if(value != null){
            askDelete = value;
        }
        else{
            askDelete = confirm("Möchtest den Artikel wirklich löschen?");
        }
        if (askDelete == true) {
            artikelLöschen(index);
        }
    }
}

function artikelLöschen(index) {
    lager.splice(index, 1);  // Remove the item at the specified index
    lagerSpeichern();
    lagerAnzeigen();
}



function lagerAnzeigen() {
    const lagerBestandTbody = document.getElementById('lagerBestand').getElementsByTagName('tbody')[0];
    lagerBestandTbody.innerHTML = '';

    lager.forEach((artikel, index) => {
        const row = lagerBestandTbody.insertRow();
        row.insertCell(0).innerText = artikel.artikelName;
        row.insertCell(1).innerText = artikel.anzahl;
        row.insertCell(2).innerText = artikel.gewicht;
        row.insertCell(3).innerText = artikel.gewicht * artikel.anzahl;

        const aktionenEditCountCell = row.insertCell(row.cells.length);
        const editCountButtonButton = document.createElement('button');
        editCountButtonButton.innerText = 'Anzahl ändern';
        editCountButtonButton.onclick = () => artikelÄndern(index, "count");
        aktionenEditCountCell.appendChild(editCountButtonButton);

        const weightEditButton = document.createElement('button');
        weightEditButton.innerText = 'Gewicht ändern';
        weightEditButton.onclick = () => artikelÄndern(index, "weight");
        aktionenEditCountCell.appendChild(weightEditButton);

        const deleteEditButton = document.createElement('button');
        deleteEditButton.innerText = 'Löschen';
        deleteEditButton.onclick = () => artikelÄndern(index, "delete");
        aktionenEditCountCell.appendChild(deleteEditButton);
    });
}



function prüfeVerfügbarkeit(rezeptArtikel) {
    return rezeptArtikel.every(item => {

        if (item.artikelName) {
            const lagerArtikel = lager.find(artikel => artikel.artikelName === item.artikelName);
            return lagerArtikel && lagerArtikel.anzahl >= item.anzahl;
        } else if (item.rezeptName) {
            const rezept = rezepte.find(r => r.rezeptName === item.rezeptName);
            return rezept && prüfeVerfügbarkeit(rezept.rezeptArtikel);
        }
        return false;
    });
}

function felderLeeren() {
    document.getElementById('artikelName').value = '';
    document.getElementById('anzahl').value = '';
    document.getElementById('gewicht').value = '';
}

function lagerSpeichern() {
    localStorage.setItem('lager', JSON.stringify(lager));
    loadData();
}

function loadData(){
    lagerAnzeigen();
}

window.onload = () => {
    loadData();

    document.getElementById('closePopup').addEventListener('click', function() {
        document.getElementById('popupContainer').style.display = 'none';
    });
};


function loadPopupContent(url, functionName) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const popupContent = document.getElementById('popupContent');
            popupContent.innerHTML = data;

            // Execute any scripts in the loaded content
            const scripts = popupContent.getElementsByTagName('script');
            for (let script of scripts) {
                const newScript = document.createElement('script');
                newScript.text = script.innerText;
                document.head.appendChild(newScript).parentNode.removeChild(newScript);
            }

            // Ensure the function is executed in the global context
            if (typeof window[functionName] === 'function') {
                window[functionName]();
            } else {
                console.error(`Function ${functionName} is not defined.`);
            }

            document.getElementById('popupContainer').style.display = 'block';
        })
        .catch(error => console.error('Error loading popup content:', error));
}