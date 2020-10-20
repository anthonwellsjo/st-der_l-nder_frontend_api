document.body.onload = loadApp;

async function loadApp() {
    await appData.get();
    appData.fetchVisitedCitiesFromLocalStorage();
    const app = document.getElementById("app");
    app.innerHTML = page.create();
    page.setBackgroundImage();
    page.renderCountryList();
    page.createUnchangingEventHandlers();
}

const page = {
    create: function () {
        return (
            `
            <img id="backgroundImg"></img>
            <div id="spinnerHolder"><img id="spinner" src="https://media0.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif?cid=ecf05e471rg1w4iot45hb8537piyun4xtfq7tv4yv4qqrq3r&rid=giphy.gif"></img></div>
            <div id="pageHolder">
                <div id="modalHolder">
                </div>
                <div class="backDrop">
                </div>
                <div id="outerFrame">
                    <div id="frame">
                        <header id="header">
                            <h1>${page.pageName}</h1>
                        </header>
                        <div id="sidebar">
                            <div id="sidebarVerticalBorder">
                            </div>
                            <header id="countryHeader">
                                <h2>
                                    Countries
                                </h2>
                                <div id="headerBottomBorder"></div>
                            </header>
                            <div id="countryNavHolder">
                                <nav id="countryNav">
                                    <ul id="countryUl">
                                    <li id="citiesVisited" class="countryListItem">Cities visited</li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        <div id="centerPage">
                            <header id="cityHeader">
                                <h2 id="cityHeaderH2">Cities</h2>
                            </header>
                            <div id="cityListHolder">
                                <div id="cityListContainer">
                                    <ul id="cityUl">
                                    </ul>
                                </div>
                                <div id="cityListInfoHolder"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
        )
    },
    renderCountryList: () => {
        appData.countries.forEach(country => {
            let li = document.createElement("li");
            li.setAttribute("class", "countryListItem");
            li.addEventListener("click", (e) => eventHandlers.onCountryClickEventHandler(e))
            li.innerHTML = country.countryname;
            document.getElementById("countryUl").prepend(li);
        })
    },
    renderCityList: () => {
        document.getElementById("cityListInfoHolder").innerHTML = "";
        page.visitedCitiesShowing = false;
        if (page.currentCountry !== page.currentlyRenderedCountryCityList) {
            document.getElementById("cityUl").innerHTML = "";
            const citiesToRender = appData.cities.filter(cit => cit.countryid === page.currentCountry.id);
            citiesToRender.forEach(city => {
                let li = document.createElement("li");
                li.setAttribute("class", "cityListItem")
                li.addEventListener("click", (e) => eventHandlers.onCityClickEventHandler(e))
                li.innerHTML = city.stadname;
                document.getElementById("cityUl").appendChild(li);
            })
            page.allVisibleListItemsShowing = false;
            setTimeout(() => { page.toggleShowListItems(); }, 10);

            page.currentlyRenderedCountryCityList = page.currentCountry;
        }
    },
    renderVisitedCityList: () => {
        if (page.currentlyRenderedCountryCityList !== appData.citiesVisited) {
            if (appData.citiesVisited.length > 0) {
                document.getElementById("cityUl").innerHTML = "";
                const citiesToRender = appData.cities.filter(cit => appData.citiesVisited.includes(cit.id));
                citiesToRender.forEach(city => {
                    let li = document.createElement("li");
                    li.setAttribute("class", "cityListItem")
                    li.innerText = city.stadname;
                    li.addEventListener("click", (e) => eventHandlers.onCityClickEventHandler(e))
                    document.getElementById("cityUl").appendChild(li);
                })
                document.getElementById("cityListInfoHolder").innerHTML = `
                    <div id="cityListInfoContainer">
                        <p>During your travels you may have crossed paths with ${appData.calculateTotalPopulations()} people.</P>
                        <button id="clearHistoryBtn">Delete your travel history</button>
                    </div>
                    `;

                document.getElementById("clearHistoryBtn").addEventListener("click", eventHandlers.onClearHistoryBtnClicked);
                page.allVisibleListItemsShowing = false;
                setTimeout(() => { page.toggleShowListItems(); page.toggleShowInfoBox(); }, 10);
                page.visitedCitiesShowing = true;
                page.currentlyRenderedCountryCityList = appData.citiesVisited;
            } else {
                document.getElementById("cityUl").innerHTML = "";
                document.getElementById("cityListInfoHolder").innerHTML = "<h3>No cities visited so far...</h3>";
            }
        }
    },
    renderCityModalPage: () => {

        //Skapar modal (är gömd för tillfället med css: translateY)
        document.getElementById("modalHolder").innerHTML = `
                        <div class="cityModal">
                            <div id="modalWindowHeader">
                                <div id="modalCloseBtnHolder">
                                    <button id="closeModalBtn">X</button>
                                </div>
                            </div>
                            <div id="modalContainer">
                                <header id="modalHeader">
                                </header>
                                <content id="modalContent">
                                    <div id="inputHolder">
                                        <button id="countryVisitedBtn">Add to visisted</button>
                                    </div>
                                </content
                            </div>
                        </div>
        `
        //Lägg till header dynamiskt

        let header = document.createElement("h2");
        header.innerText = page.currentCity.stadname;
        document.getElementById("modalHeader").appendChild(header);

        //Lägg till content dynamiskt

        let content = document.createElement("p");
        content.innerText = `
        ${page.currentCity.stadname} är en stad som ligger i ${page.currentCountry.countryname} och har ${page.currentCity.population} invånare.
        `
        document.getElementById("modalContent").prepend(content);

        //Lägg till class på modalContent som gör transition med translateY (med timeout annars blir det ingen animation)
        setTimeout(() => { document.getElementsByClassName("cityModal")[0].classList.add("open"); }, 10)

        //visa Backdrop
        page.showBackDrop();

        //Skapa event handler på stäng-knapp
        document.getElementById("closeModalBtn").addEventListener("click", eventHandlers.onModalBtnClosedClickedEventHandler)

        //Skapa event handler på add-to-visited-knapp
        document.getElementById("countryVisitedBtn").addEventListener("click", eventHandlers.onCountryVisitedBtnClickedEventHandler)

        //Kryssa för eller ur add-to-visited-knapp
        page.renderVisitedButton();

    },
    renderVisitedButton: () => {
        let visitedBtn = document.getElementById("countryVisitedBtn");
        if (appData.citiesVisited.includes(page.currentCity.id)) {
            visitedBtn.innerText = "Remove from visited";
            visitedBtn.classList.add("visited");
        } else {
            visitedBtn.innerText = "Add to visited";
            visitedBtn.className = ""
        }
    },
    showBackDrop: () => {
        document.getElementsByClassName("backDrop")[0].classList.add("show");
    },
    hideBackDrop: () => {
        document.getElementsByClassName("backDrop")[0].className = "backDrop";
    },
    createUnchangingEventHandlers: () => {
        //Backdrop click
        document.getElementsByClassName("backDrop")[0].addEventListener("click", eventHandlers.onBackDropClicked);

        //Country Click
        document.getElementById("countryHeader").addEventListener("click", eventHandlers.onCountriesHeaderClicked)

        //Cities visited Click
        document.getElementById("citiesVisited").addEventListener("click", e => { eventHandlers.onCitiesVisitedClicked(e) })
    },
    closeModal: () => {
        document.getElementsByClassName("cityModal")[0].classList.remove("open");
        page.hideBackDrop();
    },
    disactiveCountryListItems: () => {
        const lItems = document.getElementsByClassName("countryListItem");
        Object.keys(lItems).forEach(key => {
            lItems[key].classList.remove("active");
        })
    },
    disactiveCityListItems: () => {
        const lItems = document.getElementsByClassName("cityListItem");
        Object.keys(lItems).forEach(key => {
            lItems[key].classList.remove("active");
        })
    },
    toggleShowListItems: () => {
        let listItems = document.getElementsByTagName("li");
        if (!page.allVisibleListItemsShowing) {
            Object.keys(listItems).forEach(key => {
                listItems[key].classList.add("show");
            })
            page.allVisibleListItemsShowing = true;
        } else {
            Object.keys(listItems).forEach(key => {
                listItems[key].classList.remove("show");
            })
            page.allVisibleListItemsShowing = false;
        }
    },
    toggleShowCitiesHeader: () => {
        if (!page.citiesHeaderShowing) {
            document.getElementById("cityHeaderH2").classList.add("show");
            page.citiesHeaderShowing = true;
        } else {
            document.getElementById("cityHeaderH2").classList.remove("show");
            page.citiesHeaderShowing = false;
        }
    },
    toggleShowBorders: () => {
        let verticalBorder = document.getElementById("sidebarVerticalBorder");
        let horizontalBorder = document.getElementById("headerBottomBorder");

        if (!page.bordersShowing) {
            verticalBorder.setAttribute("class", "show");
            horizontalBorder.setAttribute("class", "show");
            page.bordersShowing = true;
        } else {
            verticalBorder.removeAttribute("class", "show");
            horizontalBorder.removeAttribute("class", "show");
            page.bordersShowing = false;
        }
    },
    toggleShowInfoBox: () => {
        document.getElementById("cityListInfoContainer").setAttribute("class", "show");
    },
    toggleShowBackground: () => {
        if (!page.backgroundShowing) {
            document.getElementById("frame").classList.add("open");
            page.backgroundShowing = true;
        } else {
            document.getElementById("frame").classList.remove("open");
            page.backgroundShowing = false;
        }
    },
    closeModalGroupFunction: () => {
        page.disactiveCityListItems();
        page.closeModal();
        appData.storeVisitedCitiesToLocalStorage();
        if (page.visitedCitiesShowing) {
            page.renderVisitedCityList();
        }
    },
    setBackgroundImage: () => {
        const width = window.screen.width;
        const height = window.screen.height;
        let img = document.getElementById("backgroundImg");
        img.addEventListener("load", eventHandlers.onBackgroundLoaded);
        img.setAttribute("src", `https://picsum.photos/${width}/${height}`);
    },
    pageName: "Travel Partner",
    currentCountry: {},
    currentlyRenderedCountryCityList: undefined,
    currentCity: {},
    allVisibleListItemsShowing: false,
    citiesHeaderShowing: false,
    bordersShowing: false,
    visitedCitiesShowing: false,
    backgroundShowing: false
}

const appData = {
    get: (async url => {
        let countryData = await (await (fetch('http://localhost:3000/data/countries')
            .then(res => {
                return res.json()
            })
            .catch(err => {
                console.log('Error: ', err)
            })
        ))
        let cityData = await (await (fetch('http://localhost:3000/data/cities')
            .then(res => {
                return res.json()
            })
            .catch(err => {
                console.log('Error: ', err)
            })
        ))

        appData.countries = countryData;
        appData.cities = cityData;
        appData.hasBeenFetched = true;
    }),
    storeVisitedCitiesToLocalStorage: () => {
        localStorage.setItem("citiesVisited", JSON.stringify(appData.citiesVisited))
    },
    fetchVisitedCitiesFromLocalStorage: () => {
        if (localStorage.getItem("citiesVisited") !== null) {

            const idsToAdd = JSON.parse(localStorage.getItem("citiesVisited")).map(id => +id);

            appData.citiesVisited = idsToAdd;
        } else {
            appData.citiesVisited = [];
        }
    },
    clearLocalStorage: () => {
        localStorage.removeItem("citiesVisited");
        appData.fetchVisitedCitiesFromLocalStorage();
    }
    ,
    calculateTotalPopulations: () => {
        let totalPop = 0;
        const cities = appData.cities.filter(c => appData.citiesVisited.includes(c.id));
        cities.forEach(c => totalPop += c.population);
        return totalPop;
    },
    hasBeenFetched: false,
    cities: {},
    countries: {},
    citiesVisited: []
}

const eventHandlers = {
    onCountryClickEventHandler: e => {
        page.disactiveCountryListItems();
        e.target.classList.add("active");
        page.currentCountry = appData.countries.find(c => c.countryname === e.target.innerHTML);
        page.renderCityList();
    },
    onCityClickEventHandler: e => {
        e.target.classList.add("active");
        page.currentCity = appData.cities.find(c => c.stadname == e.target.innerText);
        page.currentCountry = appData.countries.find(c => c.id === page.currentCity.countryid);
        page.renderCityModalPage();
    },
    onModalBtnClosedClickedEventHandler: () => {
        page.closeModalGroupFunction();
    },
    onCountryVisitedBtnClickedEventHandler: () => {
        if (!appData.citiesVisited.includes(page.currentCity.id)) {
            appData.citiesVisited.push(page.currentCity.id);
        } else {
            appData.citiesVisited = appData.citiesVisited.filter(c => c !== page.currentCity.id)
        }
        page.renderVisitedButton();
    },
    onBackDropClicked: () => {
        page.closeModalGroupFunction();
    },
    onCountriesHeaderClicked: () => {
        page.toggleShowListItems();
        page.toggleShowCitiesHeader();
        page.toggleShowBorders();
        page.toggleShowBackground();
    },
    onCitiesVisitedClicked: e => {
        page.disactiveCountryListItems();
        e.target.classList.add("active");
        page.renderVisitedCityList();
    },
    onClearHistoryBtnClicked: () => {
        appData.clearLocalStorage();
        page.renderVisitedCityList();
    },
    onBackgroundLoaded: () => {
        document.getElementById("spinner").setAttribute("class", "hide");
        document.getElementById("backgroundImg").setAttribute("class", "show");
        setTimeout(()=>{ document.getElementById("frame").setAttribute("class", "show");}, 600);
        document.getElementById("spinner").remove();
        document.getElementById("spinnerHolder").remove();
    }
}