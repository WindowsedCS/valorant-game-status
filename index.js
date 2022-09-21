(async () => {
    require('dotenv').config();
    const configReslover = require("./until/configReslover")
    const config = await configReslover.configReslover()
    const {Builders, ValorantXmppClient, ValorantAuthConfig} = require('valorant-xmpp-client');
    const {PresenceBuilder, KeystonePresenceBuilder, ValorantPresenceBuilder} = Builders;
    const xmppClient = new ValorantXmppClient();

    xmppClient.presence = new PresenceBuilder()
        .addKeystonePresence(new KeystonePresenceBuilder())
        .addValorantPresence(new ValorantPresenceBuilder());
    xmppClient.once('ready', () => {
        console.log('Ready to recieve presence updates');
    });
    let status_map = {};
    let uuid_map = {};
    const {GAME_TYPE_MAP} = require('./constants.json');

    let lastEmbed = {};

    const updateStatus = async () => {
        let msgString = '```\n';
        Object.keys(status_map).forEach((key) => {
            if (status_map[key].toString().toLowerCase().trim().startsWith('away')) {
                msgString += "🟡 ";

            } else {
                msgString += "🟢 ";
            }
            msgString = msgString + key.toString()+ " ➔ " + status_map[key] + "\n";


        });
        msgString += '```'
        const embed = new EmbedBuilder()
            .setTitle(`好友列表`)
            .setColor("Random")
            .setImage(config.BANNER_IMAGE_URL)
            .setFooter({text: `Powered By Empressival Status Checker ${config.version} | Updated Every ${config.UPDATE_EVERY_X_MINUTES} minutes`})
            .setDescription(`添加好友 \`${xmppClient.account.name}#${xmppClient.account.tagline}\` 以出現在列表上！
     ${msgString == "```\n```" ? "\n`⚪️ 無好友在線`" : msgString}`);

        if (lastEmbed != embed.toJSON()) {
            lastEmbed = embed.toJSON();
            client.channels.cache.get(config.STATUS_BOARD_CHANNEL_ID.toString()).messages.fetch(config.STATUS_BOARD_MESSAGE_ID.toString()).then(msg => {
                msg.edit({embeds: [embed]})
                console.log('DISCORD | Status Board Message Updated');
                setTimeout(updateStatus, 1000 * 60 * config.UPDATE_EVERY_X_MINUTES); //1000 * 60 *  config.UPDATE_EVERY_X_MINUTES
            }).catch((err) => {
                console.log(err);
            })
        }
    }

//Discord
    const Discord = require("discord.js");
    const {ActivityType, EmbedBuilder} = require("discord.js")
    const client = new Discord.Client({
        intents: [
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.DirectMessages,
            Discord.GatewayIntentBits.GuildMessageReactions
        ],
        partials: [
            Discord.Partials.Channel,
            Discord.Partials.Message,
            Discord.Partials.Reaction
        ]
    });

    const WaitUpdate = async () => {
        let msgString = '';
        if (config.STATUS_BOARD_MESSAGE_ID.toString() === "") {
            client.channels.cache.get(config.STATUS_BOARD_CHANNEL_ID.toString()).send("訊息建構中...")
        }
        const embed = new EmbedBuilder()
            .setTitle(`狀態處理中...`)
            .setDescription(`添加好友 \`\ 讀取中 \`\ 以出現在列表上！
     ${msgString == "```\n```" ? "\n`⚪️ 無好友在線`" : msgString}`)
            .setColor("Random")
            .setImage(config.BANNER_IMAGE_URL)
            .setFooter({text: `Powered By Empressival Status Checker ${config.version} | Updates Every ${config.UPDATE_EVERY_X_MINUTES} minutes`});

        client.channels.cache.get(config.STATUS_BOARD_CHANNEL_ID.toString()).messages.fetch(config.STATUS_BOARD_MESSAGE_ID.toString()).then(msg => {
            msg.edit({embeds: [embed]})
            console.log('DISCORD | Status Board Message Updated');
            setTimeout(updateStatus, 10000);
        }).catch((err) => {
            console.log(err);
        })
    }

    client.on("ready", async () => {
        console.log(`DISCORD | Logged in as ${client.user.tag}!`);
        client.user.setPresence({
            activities: [{name: config.Status, type: ActivityType.Watching}],
            status: 'online',
        });
        WaitUpdate()
    })

    client.on("ready", async () => {
        new Promise((resolve, reject) => {
            xmppClient.once('roster', async (data) => {
                for (let i = 0; i < data.roster.length; i++) {
                    uuid_map[data.roster[i].puuid] = {
                        display_name: `${data.roster[i].name}#${data.roster[i].tagline}`,
                        game_name: data.roster[i].name,
                        tag_line: data.roster[i].tagline,
                    }
                    if (Object.keys(uuid_map).length === data.roster.length) {
                        resolve();
                    }
                }
            })
        }).then(() => {
            xmppClient.on('presence', async (data) => {
                var uuid = data["sender"]["local"];

                let player = uuid_map[uuid];
                if (player != undefined) {
                    player = uuid_map[uuid];
                    if (data['gamePresence'] == null) {
                        try {
                            delete status_map[player['game_name'] + "#" + player['tag_line']];
                        } catch (e) {

                        }
                        return;
                    }

                    // If only keystone presence data , exit
                    else if (data['gamePresence'][0]['type'] == 'keystone' && data['gamePresence'].length == 1) return;

                    // If both keystone and game presence
                    else if (data['gamePresence'][0]['type'] == 'keystone' && data['gamePresence'].length > 1) {
                        var presence = data['gamePresence'][1]['presence'];
                        var presenceType = data['gamePresence'][1]['type'];
                        switch (presenceType) {
                            case 'valorant':
                                // TODO: Refactor this at some point
                                let sessionState = presence['sessionLoopState'];
                                let queueID = presence['queueId'];
                                let queue = "";
                                let status = "";
                                let scoreString = "";
                                let discordStatusString = "";
                                switch (sessionState) {
                                    case "MENUS":
                                        status = "In Lobby";
                                        break;
                                    case "PREGAME":
                                        status = "Agent Select";
                                        break;
                                    case "INGAME":
                                        status = null;
                                        break;
                                }
                                switch (queueID) {
                                    case 'unrated':
                                        queue = "Unrated";
                                        break;
                                    case 'competitive':
                                        queue = "Competitive";
                                        break;
                                    case 'deathmatch':
                                        queue = "Deathmatch";
                                        break;
                                    case 'spikerush':
                                        queue = "Spike Rush";
                                        break;
                                    case 'snowball':
                                        queue = "Snowball Fight";
                                        break;
                                    case 'replication':
                                        queue = "Replication";
                                        break;
                                    case 'ggteam':
                                        queue = "Escalation";
                                        break;
                                    default:
                                        queue = "Unknown"
                                        break;
                                }

                                if (presence['isIdle']) {
                                    if (presence['customGameTeam'] !== "") {
                                        discordStatusString = "Away";
                                    } else {
                                        discordStatusString = "Away";
                                    }
                                } else {
                                    if (status == null) {
                                        if (presence['customGameTeam'] !== "") {
                                            scoreString = presence['partyOwnerMatchScoreAllyTeam'].toString() + "-" + presence['partyOwnerMatchScoreEnemyTeam'].toString();
                                            discordStatusString = "Custom | " + scoreString;
                                        } else if (presence['matchMap'] == "/Game/Maps/Poveglia/Range") {
                                            discordStatusString = "The Range";
                                        } else {
                                            scoreString = presence['partyOwnerMatchScoreAllyTeam'].toString() + "-" + presence['partyOwnerMatchScoreEnemyTeam'].toString();
                                            discordStatusString = queue + " | " + scoreString;
                                        }
                                    } else {
                                        if (presence['customGameTeam'] !== "") {
                                            discordStatusString = status + " | Custom";
                                        } else if (presence['matchMap'] == "/Game/Maps/Poveglia/Range") {
                                            discordStatusString = "The Range";
                                        } else {
                                            discordStatusString = status + " | " + queue;
                                        }
                                    }
                                }

                                if (status_map[player['game_name'] + "#" + player['tag_line']] != discordStatusString) {

                                    status_map[player['game_name'] + "#" + player['tag_line']] = discordStatusString;


                                }

                                break;

                            case 'league_of_legends':
                                status_map[player['game_name'] + "#" + player['tag_line']] = GAME_TYPE_MAP['league_of_legends'];

                                break;

                            default:
                                status_map[player['game_name'] + "#" + player['tag_line']] = GAME_TYPE_MAP['other'];
                                console.log('Unknown Game', data['gamePresence'][1]);
                                break;
                        }
                    } else if (data['gamePresence'][1]['type'] == 'keystone' && data['gamePresence'].length > 1) {
                        var presence = data['gamePresence'][0]['presence'];
                        var presenceType = data['gamePresence'][0]['type'];
                        switch (presenceType) {
                            case 'valorant':
                                // TODO: Refactor this at some point
                                let sessionState = presence['sessionLoopState'];
                                let queueID = presence['queueId'];
                                let queue = "";
                                let status = "";
                                let scoreString = "";
                                let discordStatusString = "";
                                switch (sessionState) {
                                    case "MENUS":
                                        status = "In Lobby";
                                        break;
                                    case "PREGAME":
                                        status = "Agent Select";
                                        break;
                                    case "INGAME":
                                        status = null;
                                        break;
                                }
                                switch (queueID) {
                                    case 'unrated':
                                        queue = "Unrated";
                                        break;
                                    case 'competitive':
                                        queue = "Competitive";
                                        break;
                                    case 'deathmatch':
                                        queue = "Deathmatch";
                                        break;
                                    case 'spikerush':
                                        queue = "Spike Rush";
                                        break;
                                    case 'snowball':
                                        queue = "Snowball Fight";
                                        break;
                                    case 'replication':
                                        queue = "Replication";
                                        break;
                                    case 'ggteam':
                                        queue = "Escalation";
                                        break;
                                    default:
                                        queue = "Unknown"
                                        break;
                                }

                                if (presence['isIdle']) {
                                    if (presence['customGameTeam'] !== "") {
                                        discordStatusString = "Away";
                                    } else {
                                        discordStatusString = "Away";
                                    }
                                } else {
                                    if (status == null) {
                                        if (presence['customGameTeam'] !== "") {
                                            scoreString = presence['partyOwnerMatchScoreAllyTeam'].toString() + "-" + presence['partyOwnerMatchScoreEnemyTeam'].toString();
                                            discordStatusString = "Custom | " + scoreString;
                                        } else if (presence['matchMap'] == "/Game/Maps/Poveglia/Range") {
                                            discordStatusString = "The Range";
                                        } else {
                                            scoreString = presence['partyOwnerMatchScoreAllyTeam'].toString() + "-" + presence['partyOwnerMatchScoreEnemyTeam'].toString();
                                            discordStatusString = queue + " | " + scoreString;

                                        }
                                    } else {
                                        if (presence['customGameTeam'] !== "") {
                                            discordStatusString = status + " | Custom";
                                        } else if (presence['matchMap'] == "/Game/Maps/Poveglia/Range") {
                                            discordStatusString = "The Range";
                                        } else {
                                            discordStatusString = status + " | " + queue;
                                        }
                                    }

                                }
                                if (status_map[player['game_name'] + "#" + player['tag_line']] != discordStatusString) {
                                    status_map[player['game_name'] + "#" + player['tag_line']] = discordStatusString;
                                }
                                break;

                            case 'league_of_legends':
                                status_map[player['game_name'] + "#" + player['tag_line']] = GAME_TYPE_MAP['league_of_legends'];
                                break;

                            default:
                                status_map[player['game_name'] + "#" + player['tag_line']] = GAME_TYPE_MAP['other'];
                                console.log('Unknown Game', data['gamePresence'][1]);
                                break;

                        }
                    }
                }

            })
        })
    })
    xmppClient.login({username: config.RIOT_USERNAME, password: config.RIOT_PASSWORD});
    client.login(config.TOKEN)
})();