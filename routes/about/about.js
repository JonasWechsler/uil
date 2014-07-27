module.exports = function(app) {
    app.all('/about', function (req, res) {
        res.render('about/about', {
            title: 'LASA UIL Training',
            session: req.session,
            desc: "Lorem ipsum dolor sit amet, ne per solum timeam. Vim ne doctus timeam dolorem, in adhuc delicata maluisset per. Qui essent laoreet et. No eam tota scaevola, choro mollis vituperata te per, ut ius nibh omnium. Ea vel dico duis ridens. Ex sit tempor mandamus ocurreret, populo delectus consectetuer eu vim.",
            profiles: [{
                name: "Evan Tey",
                img: "/images/about/evan.jpg",
                desc: "It was our first week\n At Myrtle Beach\n Where it all began\n\nIt was 102°\nNothin\' to do\nMan it was hot\nSo we jumped in",
                src: "https://github.com/evantey14"
            }, {
                name: "Jonas Wechsler",
                img: "/images/about/jonas.jpg",
                desc: "We were summertime sippin\', sippin\'\nSweet tea kissin\' off of your lips\nT-shirt drippin\', drippin\' wet\nHow could I forget?",
                src: "https://github.com/JonasWechsler"
            }, {
                name: "Beck Goodloe",
                img: "/images/about/beck.jpg",
                desc: "Watchin\' that blonde hair swing\nTo every song I\'d sing\nYou were California beautiful\nI was playin\' everything but cool\nI can still hear that sound\nOf every wave crashin' down",
                src: "https://github.com/beckgoodloe"
            }, {
                name: "Ryan Rice",
                img: "/images/about/ryan.jpg",
                desc: "Like the tears we cried\nThat day we had to leave\nIt was everything we wanted it to be\nThe summer of\n19 you and me",
                src: "https://github.com/ryanr1230"
            }]
        });
    });
}