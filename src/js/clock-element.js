import {html, render, directive} from 'https://unpkg.com/lit-html?module';
//import {render, TemplateResult} from 'https://unpkg.com/lit-html@1.1.2/lib/shady-render.js?module';
//import {cache} from 'https://unpkg.com/lit-html@1.1.2/directives/cache.js?module';
//import {repeat} from 'https://unpkg.com/lit-html@1.1.2/directives/repeat.js?module';

class CustomElement extends HTMLElement{
    constructor() {
        super();
        this.createRenderRoot();
        Promise.resolve().then(()=> {
            render(this.render(), this.shadowRoot, {eventContext: this});
        });
    }

    render() {
      throw new Error('Not implemented');
    }

    createRenderRoot() {
      return this.attachShadow({mode: 'open'})
    }

    /*
     * connectedCallback: Invoked each time the custom element is appended into a document-connected element. This will happen each time the node is moved, and may happen before the element's contents have been fully parsed.
     * Note: connectedCallback may be called once your element is no longer connected, use Node.isConnected to make sure.
    */
    connectedCallback() {
        console.log('Custom element added to page.');

        if(this.isConnected) {
            //render(this.render(), this.#renderRoot);
            //render(this.render(), this.shadowRoot, { scopeName: this.tagName.toLowerCase() });
        }
        if (window.ShadyCSS !== undefined) {
            window.ShadyCSS.styleElement(this);
        }
    }

    //disconnectedCallback: Invoked each time the custom element is disconnected from the document's DOM.
    disconnectedCallback() {
        console.log('Custom element removed from page.');
    }

    //adoptedCallback: Invoked each time the custom element is moved to a new document.
    adoptedCallback() {
        console.log('Custom element moved to new page.');
    }

   /*
   * attributeChangedCallback: Invoked each time one of the custom element's attributes is added, removed, or changed. Which attributes to notice change for is specified in a static get observedAttributes method
   */
    attributeChangedCallback(name, oldValue, newValue) {
        console.log('Custom element attributes changed.');
    }

    static loadTemplate(url, paramsMap) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest(),
                params = new URLSearchParams();

            for(let key in paramsMap) {
                if(Array.isArray(paramsMap[key])) {
                    paramsMap[key].forEach((v)=> {
                        params.append(key, v);
                    });
                }else{
                    params.set(key, paramsMap[key]);
                }
            }

            params = params.toString();
            if(params) {
                url += '?' + params;
            }

            request.open('GET', url, true);

            request.onload = function() {
                resolve(request);
            };

            request.onerror = function() {
                reject(request);
            };

            request.send();
        });
    }
}

const include = directive(self=>(part)=>{
    part.setValue('Waiting for promise to resolve.');

    CustomElement.loadTemplate(self.src).then((xmlHTTP) => {
        part.setValue(html([xmlHTTP.responseText], self));
        part.commit();
    });
});

class ClockElemeent extends CustomElement{
    constructor() {
        super();
        this._date = new Date();

        window.setInterval(()=> {
            this.date = new Date();
        }, 1000);

    }

    get date() {
        return this._date;
    }

    set date(d) {
        this._date = d;
        this.update();
    }

    update() {
        render(this.render(), this.shadowRoot, {eventContext: this});
    }

    render() {
        let hours24 = this.date.getHours(),
            hours12 = hours24 % 12,
            minutes = this.date.getMinutes(),
            seconds = this.date.getSeconds(),
            period = hours24 > 12 ? 'pm' : 'am',

            dayOfWeek = new Intl.DateTimeFormat('en-US',{weekday: 'short'}).format(this.date),
            month = new Intl.DateTimeFormat('en-US',{month: 'short'}).format(this.date),
            dayOfMonth = this.date.getDate(),
            year = this.date.getFullYear();

        return html`
            <style>
                :host {
                  display: block;
                  position: relative;
                  background-color: black;
                  color: white;
                  height: 100vh;
                }
                .datetime {
                  width: 100%;
                  text-align: center;

                  position: absolute;
                  top: 50%;
                  -ms-transform: translateY(-50%);
                  transform: translateY(-50%);
                }
                .time {
                  font-size: 17vw;
                  line-height: 1em;
                }
                .time * {
                  display: inline-block;
                  padding: 0;
                  margin: 0;
                }
                .colon:after {
                  content: ':';
                }
                .period {
                    text-transform: uppercase;
                    margin-left: 3vw;
                }

                .date {
                  font-size: 5vw;
                  line-height: 1em;
                }

                .date span {
                    margin-right: 1.5vw;
                }
                .date span:last-child {
                    margin-right: 0;
                }
            </style>
            <div class="datetime">
                <div class="time">
                    <div class="hours colon">${hours12 ? hours12 : 12}</div><div class="minutes colon">${minutes}</div><div class="seconds">${seconds}</div><div class="period">${period}</div>
                </div>
                <div class="date">
                  <span class="day">${dayOfWeek}</span><span class="month">${month}</span><span class="dayOfMonth">${dayOfMonth}</span><span class="year">${year}</span>
                </div>
            </div>
        `;
    }

}
customElements.define('clock-element', ClockElemeent);
