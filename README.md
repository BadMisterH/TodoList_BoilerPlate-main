# To-Do List Boilerplate  
**Base pour un test technique de développement web**  

## 🚀 Installation  
1. Cloner le dépôt :  
`git clone https://github.com/Meta-sense/TodoList_BoilerPlate.git`

2. Se placer dans le dossier :  
`cd TodoList_BoilerPlate`

3. Installer les dépendances :  
`npm install`

4. Démarrer le serveur :  
`npm start`

5. Ouvrir `public/index.html` dans un navigateur.  

## 🛠️ Structure du projet  
public/  
├── index.html # Interface utilisateur  
├── styles.css # Styles CSS  
└── script.js # Logique front-end  
server.js # API Node.js/Express  
package.json # Dépendances  

## 🔗 API Endpoints  
| Méthode | URL          | Action                 |  
|---------|--------------|------------------------|  
| GET     | `/tasks`     | Lister les tâches      |  
| POST    | `/tasks`     | Ajouter une tâche      |  
| PUT     | `/tasks/:id` | Modifier une tâche     |  
| DELETE  | `/tasks/:id` | Supprimer une tâche    |  

*Documentez vos choix techniques dans le fichier NOTES.md*  
