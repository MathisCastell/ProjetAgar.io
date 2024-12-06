const exprimer = require("express");
const httpRequis = require("http");
const prisedecourant = require("socket.io");
const corse = require("cors");

const application = exprimer();
const serv = httpRequis.createServer(application);
const prises = prisedecourant(serv, {
    cors: { 
 origin: "http://localhost:3001", 
    methods: ["GET", "POST"],
    },
});

application.use(corse());

let joueurs = {}; 
let points = [];


//(joueur.x - point.x) ** 2 + (joueur.y - point.y) ** 2) distance
const verifierCollision = (joueur, point) => { 
   return Math.sqrt((joueur.x - point.x) ** 2 + (joueur.y - point.y) ** 2) < joueur.taille + 2; 
};
const collisionEntreJoueur = (joueur1, joueur2) => { 
  return Math.sqrt((joueur1.x - joueur2.x) ** 2 + (joueur1.y - joueur2.y) ** 2) < joueur1.taille + joueur2.taille; 
};
const creerPointRandom = () => { return { x: Math.random() * 4000, y: Math.random() * 4000 }; };
for (let compteur = 0; compteur < 1000; compteur++) {
 points.push(creerPointRandom());
}

application.get("/test", (requis, resultat) => { resultat.send("Fonctionne."); });

prises.on("connection", (prise) => {
  console.log("Nouveau joueur");

  joueurs[prise.id] = { 
    id: prise.id, 
    x: Math.random() * 2000, //spawn
    y: Math.random() * 2000, 
  taille: 10, 
    score: 0, 
    nom: prise.id 
    };
prises.emit("majJoueurs", joueurs);
prises.emit("majPoints", points);

  prise.on("majPosition", (position) => {
    const joueur = joueurs[prise.id];
    if (joueur) {
      joueur.x = position.x;
      joueur.y = position.y;
      points.forEach((point, index) => {if (verifierCollision(joueur, point)) {//fonctionnel le joueur joueur entre en collision avec un point : fonctionnel
                    joueur.taille += 2;
                    joueur.score += 10;
                    points.splice(index, 1);
                    points.push(creerPointRandom());}});

      Object.values(joueurs).forEach((autreJoueur) => {
        if (autreJoueur.id !== joueur.id && collisionEntreJoueur(joueur, autreJoueur)) {//fonctionnel le joueur joueur entre en collision avec un autre joueur
        if (joueur.taille > autreJoueur.taille) {
            joueur.taille += autreJoueur.taille;
            joueur.score += 50;
            autreJoueur.x = Math.random()* 200;
            autreJoueur.y = Math.random()*2000;
            autreJoueur.taille = 10;
            autreJoueur.score = Math.max(0, autreJoueur.score - 50);}}
            } );

          prises.emit("majJoueurs", joueurs);
          prises.emit("majPoints", points);
        }
    });

prise.on("disconnect", () => {
console.log("Déconnetion",prise.id);
delete joueurs[prise.id];
prises.emit("majJoueurs", joueurs);
});
});

serv.listen(3000, () => {
  console.log("c'est ok");
});
