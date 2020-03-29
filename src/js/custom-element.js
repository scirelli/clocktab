import {html, render, directive} from 'https://unpkg.com/lit-html?module';
//import {render, TemplateResult} from 'https://unpkg.com/lit-html@1.1.2/lib/shady-render.js?module';
import {cache} from 'https://unpkg.com/lit-html@1.1.2/directives/cache.js?module';
import {repeat} from 'https://unpkg.com/lit-html@1.1.2/directives/repeat.js?module';

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
const include2 = directive((url)=>(part)=> {
    fetch(url).then(r => r.text())
        .then(templateContent => {
            const template = document.createElement('div');
            template.innerHTML = templateContent;
            part.setValue(html`${template.childNodes}`);
            part.commit();
        });
});

class SteveElemeent extends CustomElement{
  constructor() {
    super();
    this.name = '';
  }

  render() {
      if(this.hasAttribute('data-text')) {
          this.name = this.getAttribute('data-text')
      }

      return html`<p>Hello ${this.name}</p>`;
  }

}
customElements.define('steve-element', SteveElemeent);

class IncludeElemeent extends CustomElement{
    constructor() {
        super();
        this.src = '';
    }

    /*
    render() {
        if(this.hasAttribute('data-src')) {
            this.src = this.getAttribute('data-src')
        }

        return html`${include(this)}`;
    }
    */

    render() {
        if(this.hasAttribute('data-src')) {
            this.src = this.getAttribute('data-src')
        }
        fetch(this.src).then(r => r.text())
            .then(templateContent => {
                const template = document.createElement('div'),
                    tag = (...args)=>{
                        return render(html.apply(html, args), this.shadowRoot || this);
                    };

                template.innerHTML = templateContent;
                tag`${`${template.childNodes[0].outerHTML}`}`;
            });

        return html`
            <style>:host { display: block; }</style>
            Loading...
        `;
    }
}
customElements.define('include-element', IncludeElemeent);
