module.exports = function(app) {
    app.all('/about', function (req, res) {
        res.render('about/about', {
            title: 'LASA UIL Training',
            session: req.session,
            desc: "UIL Computer Science Practice Site\n A practice site designed by Clayton Petty, Jonas Wechsler, Beck Goodloe, Evan Tey, Neil Patil, and Ryan Rice\n\nFor use by LASA High School.",
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
            }, {
                name: "Neil Patil",
                img: "/images/about/neil.jpg",
                desc: "Uh why are there song lyrics",
                src: "https://github.com/patil215"
            }]
        });
    });
}
