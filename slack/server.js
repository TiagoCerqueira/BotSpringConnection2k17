let Botkit = require('botkit');
let CLIENT_ID = process.env.client_id;
let CLIENT_SECRET = process.env.client_secret;
let PORT = process.env.PORT || 8081;

let controller = Botkit.slackbot({
    json_file_store: './db_slackbutton_bot/',
}).configureSlackApp(
    {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        scopes: ['bot'],
    }
);
controller.setupWebserver(PORT,function(err,webserver) {

    webserver.get('/',function(req,res) {
        res.sendFile('/views/add_to_slack.html', {root: __dirname});
    });

    webserver.get("/thanks", (req, res) => {
        res.sendFile('/views/thanks.html', {root: __dirname});
    });

    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            console.log("Success");
            res.redirect('/thanks')
        }
    });
});

let onlineBots = {};

function addBot(bot) {
    onlineBots[bot.config.token] = bot
}

function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function startRTM(bot) {
    if(onlineBots[bot.config.token]) {
        console.log("Déjà lancé")
    } else {
        bot.startRTM((err) => {
            if(err) {
                console.log("RTM FAIL pour le bot " + bot.config.token);
                return setTimeout(startRTM, 60000);
            } else {
                addBot(bot);
                console.log("RTM lancé")
            }
        });
    }
}

controller.on('create_bot', (bot, config) => {
    startRTM(bot);
});

controller.on('rtm_open', (bot) => {
    console.log("Connecté à l'api")
});

controller.on('rtm_close', (bot) => {
   startRTM(bot);
});

function hears(motClefs, evenements, reponses) {
    controller.hears(motClefs, evenements, (bot, message) => {
        if(message) {
            bot.reply(message, getRandomFromArray(reponses));
        }
    });
}

function hearsDefaultEvenement(motsClefs, reponses) {
    hears(motsClefs, evenements, reponses);
}
function defis(nomDefis, reponseDefis, reponseIndice) {
    controller.hears(['(.*)(' + nomDefis + ')(.*)'], evenements, (bot, message) => {
        let partieGauche = message.match[1];
        let partieDroite = message.match[3];
        let defisRegExp = new RegExp("défis|defis|défi|defi");
        let indiceRegExp = new RegExp("indice");

        // Défis ou indice peut être a gauche du nom du défis
        if(partieGauche) {
            partieGauche = partieGauche.toString().toLowerCase();
            if(defisRegExp.test(partieGauche)) {
                bot.reply(message, reponseDefis);
                return ;
            }

            if(indiceRegExp.test(partieGauche)) {
                bot.reply(message, reponseIndice);
                return ;
            }

        }

        // Défis ou indice a droite
        if(partieDroite) {
            partieDroite = partieDroite.toString().toLowerCase();
            if(defisRegExp.test(partieDroite)) {
                bot.reply(message, reponseDefis);
                return ;
            }

            if(indiceRegExp.test(partieDroite)) {
                bot.reply(message, reponseIndice);
                return ;
            }
        }

    });
}



let evenements = ['direct_message','direct_mention','mention'];

hearsDefaultEvenement(['BO 2009 HE'], ["Le mot de passe est : Ulysse aux mille expédients"]);
hearsDefaultEvenement(['hello', 'hey$', 'hi$', 'bonjour', 'salut', 'yo$', 'coucou', 'wesh', 'buenos dias', 'bom dia', 'salam'], ["Salut, je suis Eve, en quoi puis je t\'aider ? 🤖","Que puis je faire pour toi ? 🤖","Bonjour je suis Eve nom de code BO 2009 HE, je suis le guide du Spring Co. 🤖"]);
hearsDefaultEvenement(['lumiere', 'lumière'], ["Noooon ! Ne va pas vers la lumière ! J\'ai été très déçu. 😔"]);
hearsDefaultEvenement(['caca', 'pipi'], ["AH c'est mature ça !","Ici à Paris, on ne fait pas ça dans la rue. 💩"]);
hearsDefaultEvenement(['je t\'aime', 'i love you', 'amo te', 'te amo'], ["Du coup ton argent est mon argent, je peux prendre ta caution 😀 ?"]);
hearsDefaultEvenement(['hamlix', 'lix'], ["Lix est la licorne présidente. 🦄 Petite cochonne #2 🐷"]);
hearsDefaultEvenement(['Auberge','hotel','hôtel','dormir', 'hébergement', 'hebergement', 'dors', 'dort'], ["L\'auberge est BVJ Opéra, 1 rue de la tour des Dames 75009 Paris. 🛌💤 Voici un lien pour t'aider : https://citymapper.com/go/xxfees"]);
hearsDefaultEvenement(['help','perdu','aide','orga','contact','à l\'aide', '^sos', '^SOS'], ["Un souci miagiste ? Tu peux contacter Lix au : 06 99 76 96 92.","Un souci miagiste ? Tu peux contacter Elodie au : 06 11 40 20 16.","Un souci miagiste ? Tu peux contacter Kizou au : 06 52 95 93 01.","Un souci miagiste ? Tu peux contacter Oums au : 06 63 42 55 38.", "Un souci miagiste ? Tu peux contacter Tiag au : 06 50 91 09 64."]);
hearsDefaultEvenement(['restau','restaurant','flams','flam\'s','manger','mange'], ["L\'adresse du flam\'s est : 62 Rue des Lombards, 75001 Paris et le menu coûte 15 euros. 🍴Voici un lien pour t'aider : https://citymapper.com/go/y97z63"]);
hearsDefaultEvenement(['date', 'spring', 'spring co'], ["Le spring Co est du vendredi soir 21 avril au dimanche 23 avril. 🙌 Et il est organisé par les dieux de la MIAGE : Nanterre. 😉"]);
hearsDefaultEvenement(['elodick'], ["Elodie est la meilleure des sexcrétaire 💝 Petite cochonne #1 🐷"]);
hearsDefaultEvenement(['oumaima','oumss', 'ouma', 'oumi'], ["Oumaima est une VP event en or et la plus sexy ! 💝 Petite cochonne #3 🐷"]);
hearsDefaultEvenement(['licorne'], ["Ma bite sur ton front ça fait une licorne ❤️", "Pink fluffy unicorn dancing on rainbow ! 🦄"]);
hearsDefaultEvenement(['Oulala$', 'mouton', 'moutons'], ["Oulala est la mascotte mouton du BDE c'est un mouton blanc. Elle fait référence à la mascotte de l'univeristé de Nanterre Jason. 🐑 "]);
hearsDefaultEvenement(['jason'], ["Jason est un mouton noir et c'est la mascotte de Nanterre. 🐑"]);
hearsDefaultEvenement(['Bambou', 'panda roux', 'panda'], ["Bambou est la mascotte Panda Roux du BDE. 🐼"]);
hearsDefaultEvenement(['rois de la miage', 'roi de la miage'], ["Nous on code à mort et puis on boit ! 🍻🍻On dort dehors ou on dort pas ! A quoi ça sert d\'être de Nanterre Si c'est pour faire comme les lillois ? On sait qu'la MIAGE marche qu'en brassant. Et la bière y qu'ça d'important. 🍻🍻On s'fout pas mal des notes finales, On sait très bien qu'il y a l'oraaaaaaaaaaaaaaaaaal... 🎵"]);
hearsDefaultEvenement(['EDEN MIAGE', 'EDEN'], ["Au début le BDE de la MIAGE de Nanterre s'appelait MnM's, puis en 2009 il a été créé en préfecture par Malik sous le nom HotSpot. Puis pour la rentrée 2016 le nom a été changé pour EDEN MIAGE (Etudiants DE Nanterre en MIAGE)."]);
hearsDefaultEvenement(['JMC PD'], ["NON ! JMC PLD ! Soyez poli enfin ! 😬"]);
hearsDefaultEvenement(['hehe'], ["Et en plus de ça t'es fier(e) ?"]);
hearsDefaultEvenement(['3 petites cochonnes', '3 petite cochonne', '3 petite cochonnes', '3 petites cochonne', 'toirs petites cochonnes', 'cochonnes', 'trois petite cochonne', 'trois petite cochonnes', 'trois petites cochonne'], ["Les 3 petites cochonnes, les vraies d'origine s'appellent : Nora, Julie et Clémentine. Elodie, Lix et Oums ont décidé de reprendre le flambeau. 🐷"]);
hearsDefaultEvenement(['Nanterre'], ["GANG BANG 🍆 !"]);
hearsDefaultEvenement(['miagistes quel est votre métier ?', 'miagistes quel est votre métier', 'miagiste quel est votre métier ?','miagiste quel est votre métier', 'quel est votre métier ?', 'quel est votre métier'], ["AOU AOU AOU 🐺"]);
hearsDefaultEvenement(['ta mère', 'ta mere'], ["Ta gueule ! On avait dit pas les mamans ! 👩"]);
hearsDefaultEvenement(['bite'], ['Enfin ! Pas devant les enfants ! 👶', 'Petit malin ! On peut te dépanner ?']);
hearsDefaultEvenement(['Aix-marseille', 'aix marseille', 'aix', 'marseille'], ["On t'encule ! 🙊 "]);
hearsDefaultEvenement(['lille', 'lillois'], ["Tous des consanguins !"]);
hearsDefaultEvenement(['alice'], ["The tresorière ! Mascotte officielle ! Don't touch ! Propriété privée de Lix ! 💖"]);
hearsDefaultEvenement(['tiagal', 'tiago'], ["Un Tiagal des Tiago !"]);
hearsDefaultEvenement(['kenya'],["Tu ne sais pas qui est Kenya ?! Nan mais allo ! C'est THE MEMBRE ! Sans elle pas d'auberge ! Y a pas plus motivée et efficace que Kizou💖Nan c'est la notre et on partage pas !!"]);
hearsDefaultEvenement(['miage'], ["La MIAGE c'est le partage !"]);
hearsDefaultEvenement(['roux'], ["Notre roux des familles ? C'est Axel bien sûr ! Le seul, l'unique !"]);
hearsDefaultEvenement(['florian'], ["Le blond ! Il a les poils brushingués !"]);
hearsDefaultEvenement(['elodie oums nath', 'elodie nath oums', 'oums nath elodie', 'oums elodie nath', 'nath elodie oums', 'nath oums elodie'], ['Hmmm oui ? Tu as composé le numéro des 3 petites cochonnes ?', 'Que veux-tu ? La totale ? C\'est parti !!','Coquin !', 'Encore des bêtises ? Mais bien sûr !','Tu en veux encore ?']);
hearsDefaultEvenement(['elodie oums', 'oums elodie'], ["Sans nath ? Bande de vilaines ! Je vais appeler Mr Grey ! 😈"]);
hearsDefaultEvenement(['sainte bière', 'sainte biere'], ["Mérites-tu de boire au nectar divin ? 🍺"]);
hearsDefaultEvenement(['Florence'], ["Elle s'appelle Mamie on te dit ! 👵"]);
hearsDefaultEvenement(['Malik'], ["Oulala j'ai chaud !!! 😍😍😍"]);
hearsDefaultEvenement([':eggplant:'], ["Ah, je pense que tu as besoin de contacter notre star académique !"]);
hearsDefaultEvenement(['cmb'], ["Ouais ils disent tous ça ! 😉"]);
hearsDefaultEvenement(['pute'], ["Non on dit madame qui travaille tard le soir. 😇"]);
hearsDefaultEvenement(['jeu', 'cohesion', 'cohésion'], ["Les dieux de la MIAGE en ont marre de s'ennuyer en Olympe (ref : vidéo des JNM 2015 de Nanterre) et sont donc à la recherche des demi-dieux les plus méritants de devenir des divinités mineures. Qui réussira à relever le défi ? "]);
hearsDefaultEvenement(['programme formation'], ["Le programme des formations est sur le site de MC 😋"]);
hearsDefaultEvenement(['prix flams', 'prix flam\'s'], ["15€ toutes les flam\'s à volonté ! 🍴"]);
hearsDefaultEvenement(['julien'], ["Il ne faut jamais laisser la caisse à cette homme ! Croyez moi ! 💰", "Que lui voulez vous à cet animal ? 🐩" ]);
hearsDefaultEvenement(['nao', 'naoufal'], ["Nao c'est le roi des pizzas ! 🍕"]);
hearsDefaultEvenement(['Les (filles|fille) de (Nanterre|nanterre) sont (bonnes|bonne)'], ["Je vois que tu as utilisé le nom de code et le mot de passe. Tu dois mettre sur l'event facebook le message suivant si tu veux gagner le défi : Petit oiseau si tu n\'as pas d\'aile tu peux pas voler."])
hearsDefaultEvenement(['viagra'], ["On a pas besoin de ça à Nanterre."]);
hearsDefaultEvenement(['batard$'], ["Au cas où tu n'aurais pas remarqué je suis un programme féminin. Le mot juste serait donc : batarde."]);
hearsDefaultEvenement(['salop$'], ["Au cas où tu n'aurais pas remarqué je suis un programme féminin. Le mot juste serait donc : salope."]);
hearsDefaultEvenement(['connard$'], ["Au cas où tu n'aurais pas remarqué je suis un programme féminin. Le mot juste serait donc : connasse."]);
hearsDefaultEvenement(['batarde'], ["Ce n\'est pas très gentil. Moi qui suis là pour t'aider..."]);
hearsDefaultEvenement(['connasse'], ["Connasse, subst. fém.,vulg. Femme très sotte. Tu veux partir, connasse. Oui, partir, cavaler ailleurs (A. Arnoux, Zulma l'infidèle,1960, p. 40)."]);
hearsDefaultEvenement(['salope'], ["Pourquoi tant de haine ?"]);
hearsDefaultEvenement(['tu boudes'], ["Oui, pourquoi ? Sans raison particulière. Je suis une femme après tout."]);
hearsDefaultEvenement(['(comment|coment) (vas|va) tu ?', '(ça|ca) va ?'], ["Je suis un bot... C'est quoi cette question ?"]);
hearsDefaultEvenement(['test'], ["Allo allo ? Oui j\'écoute.","1,2,test, test, vous me recevez ?"]);
hearsDefaultEvenement(['Alcool'], ["Oui au bar il y aura moult alcool ! 😉"]);
hearsDefaultEvenement(['sexe'], ["Sexe ? Je ne crois pas en posséder un. Il faudra que je demande à mon concepteur."]);
hearsDefaultEvenement(['apero','apéro'], ["APEROOOOOO !"]);
hearsDefaultEvenement(['A poil','A pwal','à poil'], ["Cachez moi cette chose que je ne saurais voir !"]);
hearsDefaultEvenement(['paquito'], ["Paquito, paquito paquito ! OOOOOH paquito paquito paquito. OH PAQUITO !"]);
hearsDefaultEvenement(['Toulouse', 'chocolatine', 'Bordeaux'], ["PAIN AU CHOCOLAT"]);
hearsDefaultEvenement(['Mulhouse'], ["Ich will ein Sauerkraut"]);
hearsDefaultEvenement(['Wall-E','wall e'], ["Eveuuuh 💞"]);
hearsDefaultEvenement(['pastis', '51'], ["51 je t\'aime, j\'en boirrais des tonneaux ! A me rouler par terre ! Dans tous les cannivaux !"]);
hearsDefaultEvenement(['mascotte','mascottes'], ["Le nom des mascottes sont Bambou, Oulala et Jason."]);
hearsDefaultEvenement(['JMC Paris La Défense','JMC Paris La Defense','JMC PLD'], ["JMC Paris La Défense s'appelle depuis un an comme cela. Avant c'était Witip. Pourquoi ? Et pourquoi pas ?!"]);
hearsDefaultEvenement(['âge JMC','age JMC', 'âge de JMC','age de JMC'], ["JMC Paris La Défense a 2 ans. C'est une JE encore toute jeune."]);
hearsDefaultEvenement(['université','universite'], ["L\'université de Nanterre est sur la ligne du RER A, direction St Germain en Laye. Le saviez-vous ? A l\'époque du général de Gaulle le site de l\'université était un terrain militaire."]);
hearsDefaultEvenement(['ADN'], ["ADN (Anciens De Nanterre) est la futur association des anciens de Nanterre. Elle est en cours de création. " ]);
hearsDefaultEvenement(['ged'], ["Tu trouveras la GED à sur le lien suivant http://miage.net/ged/ et voici les identifiants login : adminmc, mdp : 2016@dminMC"]);
hearsDefaultEvenement(['Cricri'], ["Oh Cric Crac !"]);
hearsDefaultEvenement(['Maxime'], ["Non non non ! Appelle le Céline, Hagridion ou au pire Maxou Doudou ! Mais pas Maxime quoi ... Respecte toi !"]);
hearsDefaultEvenement(['présente toi', 'presente toi'], ["Bonjour je suis Eve nom de code BO 2009 HE je suis le guide du Spring Co. 🤖"]);
hearsDefaultEvenement(['conseil','conseils'], ["Les conseils que je peux te donner c'est : D'avoir une batterie externe ou une bonne batterie pour ton téléphone. Une application qui lit les QRCodes. Et le sens de l'orientation !"]);
hearsDefaultEvenement(['(Yvann|yvan|yvann|ivan|ivann) (Josso|josso|joso)'], ["QEWAAAAA ? Tu ne connais pas Yvann Josso ?! Non mais allo quoi ! 😱"]);
hearsDefaultEvenement(['carte','map','plan'], ["Voici le plan de tous les lieux importants du Spring Co : https://drive.google.com/open?id=1TkD8lIo2K6PYPmDqjK9Qkcnr4LU&usp=sharing"]);
hearsDefaultEvenement(['ta gueule'], ["Quoi ma gueule ? Qu'est ce qu'elle a ma gueule ? 🎵"]);
hearsDefaultEvenement(['blague'], ["Certaines personnes portent un pyjama Superman. Superman porte un pyjama Chuck Norris.","Tu m'as pris pour une machine à raconter des blagues ?"]);
hearsDefaultEvenement(['guide'], ["Guide moi vers le chemin où notre amour se rejoint.💞"]);
hearsDefaultEvenement(['merci'], ["Merci qui ? Merci Jackie et Michel ! "]);
hearsDefaultEvenement(['BN',"MC"], ["Un soucis miagiste HARDCORE ?! 😱 Tu peux contacter Thomas : 06 48 29 76 28.","Un soucis miagiste HARDCORE ?! 😱 Tu peux contacter Quentin ; 06 28 75 13 68.","Un soucis miagiste HARDCORE ?! 😱 Tu peux contacter Adrien : 06 36 51 42 74.","Un soucis miagiste HARDCORE ?! 😱 Tu peux contacter Céline : 06 83 17 84 30."]);
hearsDefaultEvenement(['^ah$', 'ah !'], ["HA !"]);
hearsDefaultEvenement(['au revoir', 'Au revoir'], ["C'est ça ! Vas y, casse toi ! https://media.giphy.com/media/hmxZRW8mhs4ak/giphy.gif"]);
hearsDefaultEvenement(['cerbère','cerbere'], ["Le cerbère est le gardien de la porte des enfers. C'est une espèce de gros chien à trois têtes. http://www.dinosoria.com/religion/cerbere.jpg"]);
hearsDefaultEvenement(['morse'], ["Tu as besoin de décoder du morse ? Tiens ! http://md5decrypt.net/Code-morse/morse.gif"]);
hearsDefaultEvenement(['Caipirinha|caipirinha'], ["Toi tu rêves du sud non ? 🍹"]);
hearsDefaultEvenement(['(Je|je) t\'emmerde'], ["Et moi je t'encule c'est plus sportif. 😈"]);
hearsDefaultEvenement(['(où|ou|Où|Ou)(.*)respect'], ["Dant ton cul ! Tu as bien vérifié au fond à gauche ? 😈"]);
hearsDefaultEvenement(['Paris', 'paris'], ["On t'a déjà dit que Nanterre ce n'est pas à Paris ! Tu es Tétû(e) 😔"]);
hearsDefaultEvenement(['Nice', 'nice'], ["C'est trop au sud ça… Quand est-ce que vous nous invitez ? 😛"]);
hearsDefaultEvenement(['Mot de passe', 'mdp', 'mot de passe', 'Password', 'password'], ["Tu as vraiment cru que je te le donnerai aussi facilement ?"]);
hearsDefaultEvenement(['argent', 'Argent'], ["Non on dit arrrrrrrgent ! Avec 7 R !", "Rendre l'argent ? Vous devez me confondre avec Monsieur Fillon."]);
hearsDefaultEvenement(['arrrrrrrgent', 'Arrrrrrrgent'], ["Vous, êtres humains, êtes tous aussi cupides ! EXTERMINATE!!! 🤖"]);
hearsDefaultEvenement(['baiser', 'Baiser', 'baizer', 'Baizer', 'bèze', 'Bisou', 'bisou'], ["Le premier baiser est l'effleurement des lèvres de la rose par les doigts délicats de le brise où l'on entend la rose pousser un long soupir desoulagement et un doux gémissement."]);
hearsDefaultEvenement(['froid'], ["Et pourtant, il n'y a pas si longtemps il faisait beau et chaud… 🌞"]);
hearsDefaultEvenement(['moche'], ["C'est toi le moche !"]);
hearsDefaultEvenement(['Sorbonne', 'sorbonne'], ["Là nous sommes d'accord, Sorbonne c'est bien à Paris !", "T'as vu, Sorbonne ça rime avec bonne 😏"]);
hearsDefaultEvenement(['MIP', 'mip'], ["La MIP c'est nos vieux préférés ! 😊"]);
hearsDefaultEvenement(['Fillon', 'fillon', 'fion', 'Fion'], ["RENDS L'ARGENT!!! 💰💸"]);
hearsDefaultEvenement(['fdp', 'pute', 'FDP', 'Pute'], ["Non mais, je ne te permets pas ! 😮😠"]);
hearsDefaultEvenement(['Rennes', 'rennes'], ["http://www.santatelevision.com/perenoel/files/image_renne_laponie_finlande.jpg"]);
hearsDefaultEvenement(['⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️'], ["Il n'y a rien à voir ici, circulez. 👮"]);
hearsDefaultEvenement(['comptable'], ["https://scontent-cdg2-1.xx.fbcdn.net/v/t31.0-8/s960x960/17966985_10211287933905536_8865472063882881888_o.jpg?oh=2f0884dbe5accc255c5cd2401917bbc2&oe=59861E87"]);


hearsDefaultEvenement(['Orchidoclaste|orchidoclaste'], ["Depuis quand tu as des couilles ?"]);
hearsDefaultEvenement(['Mojito|mojito'], ["Le savais-tu ? Un(e) membre de l'orga n'aime pas la menthe 😱 !"]);
hearsDefaultEvenement(['^Répond|^répond'], ["Pose-moi des questions décentes !"]);
hearsDefaultEvenement(['tu (es|est) (bourré|bourrée)'], ["J'aimerais bien, mais je ne peux boire que de l'huile :("]);
hearsDefaultEvenement(['(Ulysse|Ulysse|ulysse|ulyse) aux (mille|milles) (expédients|expedient|expedients)'], ["Je vois que tu as utilisé le nom de code et le mot de passe. Tu dois mettre sur l'event facebook le message suivant si tu veux gagner le défi secret : Petit oiseau si tu n\'as pas d\'aile tu peux pas voler."]);

hearsDefaultEvenement(['Indice(.*)9', 'indice(.*)9'], ["Voici un indice pour le défi 9 🗡️\nhttp://img15.hostingpics.net/pics/4732311805237913002149000752541985018620o.jpg"]);
hearsDefaultEvenement(['Indice(.*)1', 'indice(.*)1'], ["Voici un indice pour le défi 1 ⚡\nhttp://img15.hostingpics.net/pics/6802901804972113002153634085412075446581o.jpg"]);
hearsDefaultEvenement(['Indice(.*)3', 'indice(.*)3'], ["Voici un indice pour le défi 3 💜\nhttp://img15.hostingpics.net/pics/3759021805311613002152134085561399534913o.jpg"]);
hearsDefaultEvenement(['Indice(.*)2', 'indice(.*)2'], ["Voici un indice pour le défi 2 🔰\nhttp://img15.hostingpics.net/pics/2315931804988213002151900752251762907539o.jpg"]);
hearsDefaultEvenement(['Indice(.*)5', 'indice(.*)5'], ["Voici un indice pour le défi 5 🏠\nhttp://img15.hostingpics.net/pics/2651891804946113002153267418781798486674o.jpg"]);
hearsDefaultEvenement(['Indice(.*)\d{1}0', 'indice(.*)\d{1}0'], ["Voici un indice pour le défi 10 💀\nhttp://img15.hostingpics.net/pics/2315931804988213002151900752251762907539o.jpg"]);
hearsDefaultEvenement(['Indice(.*)7', 'indice(.*)7'], ["Voici un indice pour le défi 7 🎼\nhttp://img15.hostingpics.net/pics/7830221805322013002148567419251541643679o.jpg"]);
hearsDefaultEvenement(['Indice(.*)8', 'indice(.*)8'], ["Voici un indice pour le défi 8 ⏳\nhttp://img15.hostingpics.net/pics/200238180497601300215023408575276165453o.jpg"]);
hearsDefaultEvenement(['Indice(.*)4', 'indice(.*)4'], ["Voici un indice pour le défi 4 💌\nhttp://img15.hostingpics.net/pics/5128671801588313002152167418891497810311o.jpg"]);
hearsDefaultEvenement(['Indice(.*)\d{1}1', 'indice(.*)\d{1}1'], ["Voici un indice pour le défi 11 🌌\nhttp://img15.hostingpics.net/pics/295015180524771300215336741877561053177o.jpg"]);
hearsDefaultEvenement(['Indice(.*)6', 'indice(.*)6'],["Voici un indice pour le défi 6 🍷\nhttp://img15.hostingpics.net/pics/9250581804968613002150300752411380093961o.jpg"]);
hearsDefaultEvenement(['Indice(.*)\d{1}2', 'indice(.*)\d{1}2'], ["Voici un indice pour le défi 12 🌄\nhttp://img15.hostingpics.net/pics/6423171805248113002150134085761531080646o.jpg"]);

defis('Athéna|athéna|Athena|athena', "Pour le défi d\'Athéna l\'équipe doit répondre juste à ce test. https://goo.gl/forms/WEHlaE65WwgCFQ0L2 Je rappelle que je suis un membre à part entière de l\'organisation. ;)");
defis('Zeus|zeus', "Zeus est le dieu suprême dans la mythologie grecque. A l'origine, personnification du ciel clair et des phénomènes célestes et météorologiques, Zeus devint le dieu souverain des dieux et des hommes, ordonnateur du monde et garant de ses lois. Votre épreuve consistera à satisfaire les divinités qui vous accompagnent. Votre épreuve dépendra de votre équipe et seul vos divinités seront les juges. (Donc il faudra noter si le défi est réussis ou non). Il faudra filmer ou prendre en photo pour mettre sur l’event facebook. Vous trouverez le détails de votre défi ici : http://img4.hostingpics.net/pics/151641DefiZeus.png", "Indice pour le défi Zeus : ");
defis('Hera|hera|Héra|héra', "Elle est la protectrice des femmes, la déesse du mariage et de la famille, gardienne de la fécondité du couple et des femmes en couches.\nPour le défi d'Héra l'équipe va devoir se serrer les coudes tel une famille et se débrouiller pour tenir 15 secondes avec exactement :\n\nS’ils sont 10 à participer : 4 pieds et 5 mains seulement au sols. S’il y a plus c’est perdu.\nS’ils sont 8 ou 9 : 8 pieds et 10 mains au sols. S’il y a plus c’est perdu.\n6 ou 7 : 3 pieds, 3 mains et 1 fesse au sols. S’il y a plus c’est perdu.\n4 ou 5 : 3 pieds et 4 mains au sols. S’il y a plus c’est perdu.\n3 ou moins : le défi est perdu\n\nLe film de 15 secondes sera mis sur l'event facebook du spring co avec nom d'équipe - défi d’Héra.");
defis('Arès|arès|ares|Ares', "Pour le défi Arès dieu de la guerre, de la destruction et de la violence, l\'équipe doit inventer un haka. Se filmer en train de le faire et poster la vidéo sur l\'event facebook du spring co en précisant nom d\'équipe - défi d\'Arès. ");
defis('Hestia|hestia', "Pour le défi Hestia l\'équipe doit reprendre le refrain des \"rois de la MIAGE\" et se filmer en le chantant. Il important de s'adapter à la culture locale. Le film doit être mis sur l\'event facebook du spring co en précisant nom d\'équipe - défi Hestia. https://youtu.be/spW72ZRwp28?t=6m50s Voici de quoi vous aider sinon je connais les paroles. ;)");
defis('Hadès|hadès|hades|Hades', "Hadès règne sous la terre et pour cette raison il est souvent considéré comme le « maître des Enfers ». Les divinités vont vous expliquer le défi. Il suffit de le leur demander.");
defis('Hermès|hermès|hermes|Hermes|hérmès|Hérmès', "Pour le défi Hermès, dieux du voyage, de la communication, des commerces et de la diplomatie vous allez devoir trouver la sainte bière au Velvet.")
defis('Apollon|apollon|appollon|Appollon', "Pour le défi Apollon, dieu des arts, l\'équipe doit, comme pour une pyramide humaine, faire l\'arche de la défense et la tour eiffel. Les photos des deux monuments devront être postées sur l\'event facebook  du spring co en précisant nom d\'équipe - défi Apollon. En gros, avec votre corps il faut dessiner l’arche de la défense et la tour eiffel. Attention pas couché par terre mais debout !!");
defis('Chronos|chronos', "Pour le défi Chronos, dieu du temps, l\'équipe doit faire un mannequin challenge sur le thème d\'un banquet grec ou en rapport avec votre nom d'équipe. Rajouter des inconnus au mannequin challenge est un bonus ! Vous devez le filmer et l\'envoyer sur l\'event facebook du spring co en précisant nom d\'équipe - défi Chronos.");
defis('Hermès|Hermes|hermès|hermes', "Pour le défi Hermès, dieux du voyage, de la communication, des commerces et de la diplomatie vous allez devoir trouver la sainte bière dans l'établissement MACHIN. ");
defis('Nix|nix',"Nyx est la déesse personnifiée de la nuit. Dans le noir tu seras ! Il va falloir bander les yeux d’une personne.\nDevant cette dernière toute l’équipe va se mettre à la queuleuleu sans bruit.\nAu toucher, la personne aux yeux bandés va devoir reconnaître la personne devant son équipe qui est devant elle.\nSi elle trouve elle passe à la personne suivante.\nSi elle ne trouve pas ou donne un mauvais prénom elle donne le bandeau à la personne. Et ainsi on inverse les rôles. L’équipe se remélange.\nSi la personne aux yeux bandés à trouvé toute son équipe on change de personne avec le bandeau.\n\nObjectif : En 1 minutes, chronométré par l'orga de Nanterre il faut retrouver le plus de personne de son équipe. L'orga de Nanterre note le nombre de personne trouvé.");
defis('Dionysos|dionysos|dyonysos|Dyonysos|Dionisos|dionisos', "Le défi de ton dieu préféré est ici http://img15.hostingpics.net/pics/206706DefiDionysos.png");
defis('Ether|ether', "Lui-même personnifie le Ciel dans ses parties supérieures. L'air y est plus pur et plus chaud. C'est celui qui est respiré par les dieux, contrairement à l'Ær (en grec ancienἀήρ / aếr), l'air des parties inférieures du ciel, respiré par les mortels.\nEther ne se sentant pas concerné par les mortels a refusé de vous donner un défi. Vous avez le droit d’insulter Ether sur l’event facebook avec une insulte créative en rapport avec la divinité de votre équipe pour remporter ce défi.");

hearsDefaultEvenement(['musique'], ["Oui il y aura de la musique au bar samedi ! N'hésite pas à aller voir des amis sympa à Tiago sur cette page : https://www.facebook.com/Supamoonofficial"]);
hearsDefaultEvenement(['blacksmith'], ["C'est notre partenaire local !"]);
hearsDefaultEvenement(['chartreuse'], ["Ahhh tu viens de Grenoble toi !"]);
hearsDefaultEvenement(['questionnaire', 'formulaire'], ["Donne moi le nom de la formation et je te donnerai le lien vers le questionnaire 😉"]);
hearsDefaultEvenement(['pioupiou', 'fillot', 'noob', 'nouveau'], ["Le questionnaire de l'atelier Pioupiou, c'est ici : https://goo.gl/forms/fO5mfRk85Tp1ybxl1 😉"]);
hearsDefaultEvenement(['event', 'events', 'événement', '(GT|Groupe de travail) (Event|event|évent|événement|Événement)'], ["Le questionnaire du groupe de travail événement, c'est ici : https://goo.gl/forms/2geeGE9npZ9ACij52 😉"]);
hearsDefaultEvenement(['boobz', 'girlz', '(GT|Groupe de travail) (Girlz|girlz|femmes|Femmes|femme|Femme) (in|en) MIAGE'], ["Le questionnaire du  groupe de travail Girlz in MIAGE, c'est ici : https://goo.gl/forms/2ZtFHFu33tapTgHa2 😉"]);
hearsDefaultEvenement(['(Temps|temps|temp|Temp) (admin|admins|Admin|Admins|BDE|réseau|Réseau|bde)'], ["Le questionnaire du temps réseau BDE, c'est ici : https://goo.gl/forms/noD3ww1ONui7F2Nw1 😉"]);
hearsDefaultEvenement(['entrepreneur', 'entrepreneuriat', '(Black Smith|BlackSmith|black smith)', '(startup|start-up)', 'écosystème'], ["Le questionnaire de la formation Écosystème startup français, c'est ici : https://goo.gl/forms/noD3ww1ONui7F2Nw1 😉"]);
hearsDefaultEvenement(['RFP', '(Processus|Process|process|processus)(.*)BDE', 'passation'], ["Le questionnaire de la formation Processus RFP pour BDE, c'est ici : https://goo.gl/forms/c3mgYr94uznh1NRV2 😉"]);
hearsDefaultEvenement(['(Community Management|CM|community management)'], ["Le questionnaire de la formation Community Management, c'est ici : https://goo.gl/forms/OepVys562Hz7VVIS2 😉"]);
hearsDefaultEvenement(['influence', 'veille'], ["Le questionnaire de la formation Veille et Influence grâce aux réseaux sociaux, c'est ici : https://goo.gl/forms/EluPeg2GjKdCea0H2 😉"]);
hearsDefaultEvenement(['(GT|Groupe|groupe)(.*)(site|site web|site Web|site Internet|site internet)'], ["Le questionnaire du groupe de travail sur la refonte du site, c'est ici : https://goo.gl/forms/VQCUJeBjWOzzYm5m2😉"]);
hearsDefaultEvenement(['(Temps|temps|temp|Temp) (Élu|élu|elu)'], ["Le questionnaire du temps réseau BDE, c'est ici : https://goo.gl/forms/5Jxgnw9RL13hJcGi1 😉"]);
hearsDefaultEvenement(['(GT|Groupe|groupe)(.*)(diplome|diplôme|Diplome|Diplôme|plôme)'], ["Le questionnaire du Groupe de Travail Diplôme, c'est ici : https://goo.gl/forms/pr06o8zhIDd2ktzQ2 😉"]);
hearsDefaultEvenement(['(Trésorerie|trésorerie|tréso|treso|tresorerie) (JE|Junior|CNJE)'], ["Le questionnaire de la formation Trésorerie CNJE est ici : https://goo.gl/forms/kjefVCICir4S1gWl1 😉"]);
hearsDefaultEvenement(['(RFP|rfp|passation|Passation)(.*)(JE|Junior|junior|CNJE)'], ["Le questionnaire de la formation RFP CNJE est ici : https://goo.gl/forms/iYXA70WEEYZfNDde2 😉"]);
hearsDefaultEvenement(['(Temps|temps|temp|Temp) (JE|Junior|junior)'], ["Les questionnaires du temps JE sont ici :\nCréneau 1 : https://goo.gl/forms/2fC80NJC1lm20IFi2\nCréneau 2 : https://goo.gl/forms/btCv1wLQPZgyq7R02\nJe me demande bien pourquoi ils ont deux formulaires pour la même formation 🤔"]);
hearsDefaultEvenement(['(Formation|formation|forma|Forma) (alumni|Alumni|Papi|papi)'], ["Le questionnaire de la formation Alumni, c'est ici : https://goo.gl/forms/P0kQaWIk0r94y6Fm2 😉"]);
hearsDefaultEvenement(['question'], ["Réponse !"]);

controller.hears(["Bar(.*)"], evenements, (bot, message) => {
    let suite = message.match[1];

    if(!suite) {
        bot.reply(message, "Je n\'ai pas compris 😞. Tu veux le \"bar du vendredi\" ou le \"bar du samedi\" ? 🍺");
        return;
    }
    if (suite.toString().toLowerCase().indexOf("vendredi") !== -1) {
        bot.reply(message, "Le bar du vendredi est le Sémaphore, 32 Rue de Londres 75009 Paris. 🍺 Voici un lien pour t'aider : https://citymapper.com/go/5dvgtu");
        return;
    } else if (suite.toString().toLowerCase().indexOf("samedi") !== -1) {
        bot.reply(message, "Le bar du samedi est le bistrot Cockney, 39 Boulevard de Clichy 75009 Paris. 🍻 Voici un lien pour t'aider : https://citymapper.com/go/1jf39c");
        return;
    } else {
        bot.reply(message, "Je n\'ai pas compris 😞. Tu veux le \"bar du vendredi\" ou le \"bar du samedi\" ? 🍺");
        return;
    }

});



controller.hears(['formation(.*)?'], ['direct_message','direct_mention','mention'], (bot,message) => {
    let formation = message.match[1];

    if(message && formation) {
        bot.reply(message, "La formation " + formation + " se situe à ...")
    }
});

hearsDefaultEvenement(['bar', 'bars', 'j\'ai soif', 'soif', 'boire'], ["Je n\'ai pas compris 😞. Tu veux le \"bar du vendredi\" ou le \"bar du samedi\" ? 🍺"]);


controller.storage.teams.all((err, teams) => {
    if(err) {
        throw new Error(err)
    }

    for(let t in teams) {
        if(teams[t].bot) {
            controller.spawn(teams[t]).startRTM((err, bot) => {
                if(err) {
                    console.log("Erreur lors du lancement du bot", err)
                } else {
                    addBot(bot)
                }
            })
        }
    }
});

hearsDefaultEvenement(['eve$', 'Eve$'], ["Veuillez me fournir le mot de passe. 🔐"]);
