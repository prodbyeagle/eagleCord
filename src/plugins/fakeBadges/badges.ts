import { ProfileBadge } from "@api/Badges";

export interface ProfileBadgeWithName extends ProfileBadge {
    /** Display name for settings UI */
    name: string;
}

export const BADGES: ProfileBadgeWithName[] = [
    // {
    //     name: "Discord Nitro ( Classic )",
    //     image: "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png",
    //     description: "Subscriber since 01/03/2020"
    // },
    // {
    //     name: "Discord Nitro ( Silver )",
    //     image: "https://cdn.discordapp.com/badge-icons/4514fab914bdbfb4ad2fa23df76121a6.png",
    //     description: "Subscriber since 01/03/2020"
    // },
    // {
    //     name: "Discord Nitro ( Gold )",
    //     image: "https://cdn.discordapp.com/badge-icons/2895086c18d5531d499862e41d1155a6.png",
    //     description: "Subscriber since 01/03/2020"
    // },
    // {
    //     name: "Discord Nitro ( Platinum )",
    //     image: "https://cdn.discordapp.com/badge-icons/0334688279c8359120922938dcb1d6f8.png",
    //     description: "Subscriber since 01/03/2020"
    // },
    // {
    //     name: "Discord Nitro ( Diamond )",
    //     image: "https://cdn.discordapp.com/badge-icons/0d61871f72bb9a33a7ae568c1fb4f20a.png",
    //     description: "Subscriber since 01/03/2020"
    // },
    // {
    //     name: "Discord Nitro ( Emerald )",
    //     image: "https://cdn.discordapp.com/badge-icons/11e2d339068b55d3a506cff34d3780f3.png",
    //     description: "Subscriber since 01/03/2020"
    // },
    // {
    //     name: "Discord Nitro ( Ruby )",
    //     image: "https://cdn.discordapp.com/badge-icons/cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4.png",
    //     description: "Subscriber since 01/03/2020",
    // },
    // {
    //     name: "Discord Nitro ( Opal )",
    //     image: "https://cdn.discordapp.com/badge-icons/5b154df19c53dce2af92c9b61e6be5e2.png",
    //     description: "Subscriber since 01/03/2020"
    // },
    // {
    //     name: "HypeSquad Bravery",
    //     image: "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png",
    //     description: "HypeSquad Bravery"
    // },
    // {
    //     name: "HypeSquad Brilliance",
    //     image: "https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png",
    //     description: "HypeSquad Brilliance"
    // },
    // {
    //     name: "HypeSquad Balance",
    //     image: "https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png",
    //     description: "HypeSquad Balance"
    // },
    // {
    //     name: "HypeSquad Events",
    //     image: "https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png",
    //     description: "HypeSquad Events"
    // },
    // {
    //     name: "Bug Hunter Level 1",
    //     image: "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png",
    //     description: "Bug Hunter"
    // },
    // {
    //     name: "Bug Hunter Level 2",
    //     image: "https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png",
    //     description: "Bug Hunter"
    // },
    // {
    //     name: "Active Developer",
    //     image: "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png",
    //     description: "Active Developer"
    // },
    // {
    //     name: "Early Verified Bot Developer",
    //     image: "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png",
    //     description: "Early Verified Bot Developer"
    // },
    // {
    //     name: "Early Supporter",
    //     image: "https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png",
    //     description: "Early Supporter"
    // },
    // {
    //     name: "Moderator Programs Alumni",
    //     image: "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png",
    //     description: "Moderator Programs Alumni"
    // },
    // {
    //     name: "Booster Diamond",
    //     image: "https://cdn.discordapp.com/badge-icons/ec92202290b48d0879b7413d2dde3bab.png",
    //     description: "Server boosting since Jan 01, 2025"
    // },
    // {
    //     name: "Booster Emerald",
    //     image: "https://cdn.discordapp.com/badge-icons/7142225d31238f6387d9f09efaa02759.png",
    //     description: "Server boosting since Jan 01, 2025"
    // },
    // {
    //     name: "Booster Square",
    //     image: "https://cdn.discordapp.com/badge-icons/996b3e870e8a22ce519b3a50e6bdd52f.png",
    //     description: "Server boosting since Jan 01, 2025"
    // },
    // {
    //     name: "Booster Star",
    //     image: "https://cdn.discordapp.com/badge-icons/991c9f39ee33d7537d9f408c3e53141e.png",
    //     description: "Server boosting since Jan 01, 2025"
    // },
    // {
    //     name: "Booster Default w/ Stars",
    //     image: "https://cdn.discordapp.com/badge-icons/72bed924410c304dbe3d00a6e593ff59.png",
    //     description: "Server boosting since Jan 01, 2025"
    // },
    // {
    //     name: "Booster Pyramid",
    //     image: "https://cdn.discordapp.com/badge-icons/51040c70d4f20a921ad6674ff86fc95c.png",
    //     description: "Server boosting since Jan 01, 2025"
    // },
    // {
    //     name: "Booster",
    //     image: "https://cdn.discordapp.com/badge-icons/72bed924410c304dbe3d00a6e593ff59.png",
    //     description: "Server boosting since Jan 01, 2025"
    // },
    // {
    //     name: "AutoMod",
    //     image: "https://cdn.discordapp.com/badge-icons/f2459b691ac7453ed6039bbcfaccbfcd.png",
    //     description: "Uses Automod",
    // },
    // {
    //     name: "Supports Commands",
    //     image: "https://cdn.discordapp.com/badge-icons/6f9e37f9029ff57aef81db857890005e.png",
    //     description: "Supports Commands",
    // },
    // {
    //     name: "Quest Completion",
    //     image: "https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png",
    //     description: "Quest Completed"
    // },
    // {
    //     name: "Username Change",
    //     image: "https://cdn.discordapp.com/badge-icons/6de6d34650760ba5551a79732e98ed60.png",
    //     description: "Originally known as username#0001"
    // },
    // {
    //     name: "Discord Orbs",
    //     image: "https://github.com/mezotv/discord-badges/raw/main/assets/orb.svg",
    //     description: "Orbs",
    //     props: { style: { scale: 0.8 } }
    // },
    // {
    //     name: "Discord Lootbox",
    //     image: "https://github.com/mezotv/discord-badges/raw/main/assets/special/discordlootbox.svg",
    //     description: "A clown, for a limited time",
    //     props: { style: { scale: 1.1 } }
    // },
    {
        name: "pssss",
        image: "https://kappa.lol/GO0AI5",
        description: "Quiet... no one asked."
    },
    {
        name: "Suspicious",
        image: "https://kappa.lol/Ubc73U",
        description: "Kinda sus, not gonna lie."
    },
    {
        name: "Shocked",
        image: "https://kappa.lol/BaizS6",
        description: "OMG?! I can't believe this."
    },
    {
        name: "Nerd Alert",
        image: "https://kappa.lol/UnAm4M",
        description: "Well, *actually*..."
    },
    {
        name: "Called Out",
        image: "https://kappa.lol/Aa-612",
        description: "That’s the guy, officer."
    },
    {
        name: "Middle Finger",
        image: "https://kappa.lol/RBROxk",
        description: "With all due respect... nope."
    },
    {
        name: "Standing Ovation",
        image: "https://kappa.lol/8okDe1",
        description: "*clap clap* truly majestic."
    },
    {
        name: "Zombie Mode",
        image: "https://kappa.lol/xtmBqM",
        description: "Brain... not found."
    },
    {
        name: "On Fire",
        image: "https://kappa.lol/GE8D0d",
        description: "Too hot to handle."
    },
    {
        name: "Superstar",
        image: "https://kappa.lol/tHP9IS",
        description: "You're not just a star — you're *the* star."
    },
    {
        name: "Lucky Charm",
        image: "https://kappa.lol/_TbTdV",
        description: "May the odds be ever in your favor."
    },
    {
        name: "Certified Dumbass",
        image: "https://kappa.lol/oYByy2",
        description: "*insert goofy laugh*"
    },
];
