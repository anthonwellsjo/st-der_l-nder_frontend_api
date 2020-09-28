
document.body.onload = loadApp;


async function loadApp() {
    await appData.get();
    const app = document.getElementById("app");
    page.appendChild(page.create(), app);

}






const page = {
    create: function () {
        return (
            `<div id="pageHolder">
                <div id="frame">
                    <header id="header">
                        <h1>${page.pageName}</h1>
                    </header>
                    <div id="sidebar">
                        <div id="countryNavHolder">
                            <nav id="countryNav">
                                <ul id="countryOl">
                                ${appData.renderCountryList()}
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <div id="centerPage">
                        <div id="cityListHolder">
                            <div id="cityListContainer">
                                <ul id="cityList">
                                ${appData.renderCityList()}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
        )
    },
    appendChild: function (child, parent) {
        parent.innerHTML = child;
        return;
    },
    pageName: "Travel Partner",


}

const appData = {
    get: (async url => {
        let countryData = await (await (fetch('./src/json/land.json')
            .then(res => {
                return res.json()
            })
            .catch(err => {
                console.log('Error: ', err)
            })
        ))
        let cityData = await (await (fetch('./src/json/stad.json')
            .then(res => {
                return res.json()
            })
            .catch(err => {
                console.log('Error: ', err)
            })
        ))

        console.log("countrydata", countryData);
        console.log("citydata", cityData);
        appData.countries = countryData;
        appData.cities = cityData;
        appData.hasBeenFetched = true;
    }),
    renderCountryList: () => {
        let htmlString = "";
        appData.countries.forEach(country => {
            htmlString+=`<li class="countryListObject">${country.countryname}</li>`
        })
        return htmlString;
    },
    renderCityList: () => {
        let htmlString = "";
        appData.cities.forEach(city => {
            
        })
        return "<li>Test Stad</li>"
    },
    hasBeenFetched: false,
    cities: {},
    countries: {}
}
