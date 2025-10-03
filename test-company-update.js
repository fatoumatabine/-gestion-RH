// Test script pour vérifier la validation de mise à jour d'entreprise
const testData = {
  nom: "Test Company",
  telephone: "+221776669898",
  email: "test@example.com",
  devise: "XOF",
  periodePayroll: "MENSUEL",
  timezone: "Africa/Dakar",
  couleurPrimaire: "#ff5733",
  couleurSecondaire: "#33ff57",
  couleurDashboard: "#3357ff",
  estActive: true
};

console.log("Test data:", JSON.stringify(testData, null, 2));

// Test avec curl
const curlCommand = `curl -X PUT http://localhost:5000/api/companies/9 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '${JSON.stringify(testData)}'`;

console.log("\nCurl command:");
console.log(curlCommand);