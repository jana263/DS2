/*made slight changes*/
function getValues() {
    const {
      inputMontant,
      inputTaux,
      inputAnnee
    } = window;
    let montant = Math.abs(inputMontant.valueAsNumber) || 0,
        annee = Math.abs(inputAnnee.valueAsNumber) || 0,
        mois = annee * 12 || 1,
        taux = Math.abs(inputTaux.valueAsNumber) || 0,
        tauxMensuel = taux / 100 / 12;
    return { montant, annee, mois, taux, tauxMensuel };
  }
  
  let calculMensualite = function(montant, tauxMensuel, mois) {
    let remboursementMensuel;
    if (tauxMensuel) {
      remboursementMensuel = montant * tauxMensuel / (1 - (Math.pow(1 / (1 + tauxMensuel), mois)));
    } else {
      remboursementMensuel = montant / mois;
    }
    return remboursementMensuel;
  };
  
  let calculAmortissement = (montant, tauxMensuel, mois, annee) => {
    let remboursementMensuel = calculMensualite(montant, tauxMensuel, mois);
    let balance = montant;
    let amortissementY = [];
    let amortissementM = [];
    for (let y = 0; y < annee; y++) {
      let interestY = 0;
      let montantY = 0;
      for (let m = 0; m < 12; m++) {
        let interestM = balance * tauxMensuel;
        let montantM = remboursementMensuel - interestM;
        interestY += interestM;
        montantY += montantM;
        balance -= montantM;
        amortissementM.push({
          remboursementMensuel,
          capitalAmorti: montantM,
          interet: interestM,
          capitalRestantDu: balance
        });
      }
      amortissementY.push({
        remboursementMensuel,
        capitalAmorti: montantY,
        interet: interestY,
        capitalRestantDu: balance
      });
    }
    return { remboursementMensuel, amortissementY, amortissementM };
  };
  
  function formatNumber(number) {
    return number.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    });
  }
  
  function remplirTableau(amortissement) {
    let html = `<thead>
      <tr>
        <th>Période</th>
        <th>Capital Amorti</th>
        <th>Intérêts</th>
        <th>Capital Restant Dû</th>
        <th>Mensualité</th>
      </tr>
    </thead>`;
    amortissement.forEach(({ remboursementMensuel, capitalAmorti, interet, capitalRestantDu }, index) => {
      html += `
        <tr class=${Math.round(capitalAmorti) < Math.round(interet) ? "warning" : ""}>
          <td>${index + 1}</td>
          <td>${formatNumber(capitalAmorti)}</td>
          <td>${formatNumber(interet)}</td>
          <td>${formatNumber(capitalRestantDu)}</td>
          <td>${formatNumber(remboursementMensuel)}</td>
        </tr>`;
    });
    document.getElementById("inputMensualite").innerHTML = html;
  }
  
  function validateInputs() {
    const { inputMontant, inputTaux, inputAnnee } = window;
    if (!inputMontant.value || inputMontant.value <= 0) {
      alert("Veuillez entrer un montant valide.");
      return false;
    }
    if (!inputTaux.value || inputTaux.value <= 0) {
      alert("Veuillez entrer un taux valide.");
      return false;
    }
    if (!inputAnnee.value || inputAnnee.value <= 0) {
      alert("Veuillez entrer une durée en années valide.");
      return false;
    }
    return true;
  }
  
  Array.from(document.querySelectorAll('input'), input => {
    input.addEventListener("input", function() {
      if (validateInputs()) {
        let { montant, tauxMensuel, mois, annee } = getValues();
        let { amortissementM } = calculAmortissement(montant, tauxMensuel, mois, annee);
        remplirTableau(amortissementM);
        afficherGraphique(amortissementM);
      }
    });
  });
  //au niveau de cette fonction qui n'est pas parfaite 
  function afficherGraphique(amortissementM) {
    const ctx = document.getElementById('amortissementChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: amortissementM.map((_, index) => index + 1),
        datasets: [
          {
            label: 'Capital Amorti',
            data: amortissementM.map(({ capitalAmorti }) => capitalAmorti),
            borderColor: 'rgb(75, 192, 192)',
            fill: false,
          },
          {
            label: 'Intérêts',
            data: amortissementM.map(({ interet }) => interet),
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Amortissement du prêt'
        }
      }
    });
  }
  