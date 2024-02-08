/*

Отображение и загрузка калькулятора
Разработно: Пономарев Максим

*/

let identificators = {};
let cart = [];
let showedTickets = [];

loadCalc();

// Ф-я для загрузки калькулятора за один API запрос
function loadCalc() {
    fetch(window.location.href + '/api/loadCalc')
        .then( function (response) {

            response.text().then( function (text) {

                const nav_elem = document.getElementById('navigation');

                let counter = 0;
                let data = JSON.parse(text);
                data.result.map(element => {
                    // Создание и добавление кнопки в навигационное меню
                    btn = createNavigationButton(element, counter);
                    nav_elem.appendChild(btn);

                    // Добавляем селекторы
                    addPageSelectors(element, counter);

                    counter++;
                });

                // Кликаем по первому элементу, чтобы сделать его активным
                nav_elem.firstElementChild.click();

            });
        });
};

// Создание кнопок для навигации
function createNavigationButton(element, counter) {
    const service_description = document.getElementById('service_desc');

    const new_btn = document.createElement('button');
    new_btn.value = element.name;
    new_btn.className = 'nav_link';
    new_btn.type = 'button';
    new_btn.innerText = element.name;
    new_btn.setAttribute('block_id', counter);

    new_btn.onclick = () => {
        selectNavBtn(new_btn);
        service_description.innerText = element.description;
    };

    return new_btn;
};

// Выбор услуги как активная
function selectNavBtn(elem) {
    const nav_elem = document.querySelectorAll('.nav_link');

    // прячем все ненужные input'ы
    nav_elem.forEach(function(e) {
        e.className = 'nav_link';
        document.getElementById('block_' + e.getAttribute('block_id')).hidden = true;
    });

    elem.classList.add('nav_link_selected');
    document.getElementById('block_' + elem.getAttribute('block_id')).hidden = false;

    // Скрываем help_block
    document.getElementById('help_block').hidden = true;
};

// Смена значения у слайдера "чекбокс"
function changeCheckBoxValue(e, hidden_e) {

    if (hidden_e.checked) {
        e.className = 'service_checkbox_checked';
    } else {
        e.className = 'service_checkbox';
    }
};

// Создание селектора "Слайдер"
function createSelectorSlider(element) {
    const service_inputs = document.createElement('div');
    service_inputs.className = 'service_inputs';

    const input = document.createElement('input');
    service_inputs.appendChild(input);
    input.type = 'number';
    input.name = element.id;
    input.id = element.id;
    input.className = 'service_slider_numbers';
    input.setAttribute('max', element.max_value);
    input.setAttribute('min', element.min_value);
    input.setAttribute('value', element.min_value);
    input.setAttribute('step', element.step);
    input.oninput = countCart();
    input.readOnly = true;

    const range = document.createElement('input');
    service_inputs.appendChild(range);
    range.type = 'range';
    range.name = element.id + '_slider';
    range.id = element.id + '_slider';
    range.className = 'service_slider_range';
    range.setAttribute('step', element.step);
    range.setAttribute('value', element.min_value);
    range.setAttribute('min', element.min_value);
    range.setAttribute('max', element.max_value);
    
    identificators[element.id] = {
        name: element.name,
        price: element.price,
        isOneGetService: element.isOneGetService,
        elem_type: 'slider',
        isAdditionalService: element.isAdditionalService,
        isTwoByOne: element.is_two_by_one,
        twoByOneValue: element.is_two_by_one_value
    }

    range.oninput = () => {
        document.getElementById(element.id).value = range.value;
        countCart();
    }

    // Изменяем oninput для наследуемого элемента, если таковой имеется
    if (element.inherit_by !== null && element.inherit_by !== '*') {
        const inherit_slider = document.getElementById(element.inherit_by + '_slider');
        const inherit_elem = document.getElementById(element.inherit_by);

        identificators[element.id].price = inherit_slider.value * element.price

        inherit_slider.oninput = () => {

            if (identificators[element.inherit_by].elem_type === 'named_slider') {
                inherit_elem.value = identificators[element.inherit_by].named_slider_values[inherit_slider.value];
            } else {
                inherit_elem.value = inherit_slider.value;
            }

            identificators[element.id].price = inherit_elem.value * element.price
            countCart();
        }

        // Так же притягиваем действия, если дочерний элемент не менялся
        identificators[element.id].price = inherit_elem.value * element.price
    
        range.oninput = () => {
            document.getElementById(element.id).value = range.value;

            identificators[element.id].price = inherit_elem.value * element.price

            countCart();
        }

    } else if (element.inherit_by !== null && element.inherit_by === '*') {
        input.setAttribute('inherit_by', '*');
    }



    return service_inputs;
};

// Создание селектора "Именованный слайдер"
function createSelectorNamedSlider(element) {
    const service_inputs = document.createElement('div');
    service_inputs.className = 'service_inputs';

    const input = document.createElement('input');
    let test_arr = element.value
    service_inputs.appendChild(input);
    input.type = 'number';
    input.name = element.id;
    input.id = element.id;
    input.className = 'service_slider_numbers';
    input.setAttribute('max', element.max_value);
    input.setAttribute('min', element.min_value);
    input.setAttribute('value', test_arr[0]);
    input.setAttribute('step', element.step);
    input.oninput = countCart();
    input.readOnly = true;

    const range = document.createElement('input');
    service_inputs.appendChild(range);
    range.type = 'range';
    range.name = element.id + '_slider';
    range.id = element.id + '_slider';
    range.className = 'service_slider_range';
    range.setAttribute('step', 1);
    range.setAttribute('value', 0);
    range.setAttribute('min', 0);
    range.setAttribute('max', test_arr.length - 1);
    
    identificators[element.id] = {
        name: element.name,
        price: element.price,
        isOneGetService: element.isOneGetService,
        elem_type: 'named_slider',
        named_slider_values: test_arr,
        isAdditionalService: element.isAdditionalService,
        isTwoByOne: element.is_two_by_one,
        twoByOneValue: element.is_two_by_one_value
    }

    range.oninput = () => {
        document.getElementById(element.id).value = test_arr[range.value];
        countCart();
    }

    // Изменяем oninput для наследуемого элемента, если таковой имеется
    if (element.inherit_by !== null && element.inherit_by !== '*') {
        const inherit_slider = document.getElementById(element.inherit_by + '_slider');
        const inherit_elem = document.getElementById(element.inherit_by);
        inherit_slider.onchange = () => {
            inherit_elem.value = inherit_slider.value;
            identificators[input.id].price = inherit_slider.value * element.price
            countCart();
        }
    }
    return service_inputs;
};

// Создание селектора "Чекбокс"
function createSelectorCheckbox(element) {
    const service_inputs = document.createElement('div');
    service_inputs.className = 'service_inputs';

    let id = element.id;
    let hidden_id = element.id + '_hidden';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('name', hidden_id);
    checkbox.setAttribute('id', hidden_id);
    checkbox.hidden = true;
    checkbox.className = 'service_checkbox_hidden';
                                
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'service_checkbox';
    btn.setAttribute('onclick', hidden_id + '.checked = !(' + hidden_id + '.checked); changeCheckBoxValue(this, ' + hidden_id + '); countCart();');
    btn.id = id;

    service_inputs.appendChild(checkbox);
    service_inputs.appendChild(btn);
    
    identificators[hidden_id] = {
        name: element.name,
        price: element.price,
        isOneGetService: element.isOneGetService,
        elem_type: 'checkbox',
        isAdditionalService: element.isAdditionalService
    };
    
    identificators[id] = {
        name: element.name,
        price: element.price,
        isOneGetService: element.isOneGetService,
        elem_type: 'checkbox',
        isAdditionalService: element.isAdditionalService
    };

    return service_inputs;
};

// Создание селектора "Список"
function createSelectorList(element) {
    // Создание селектора "Список"
    const service_inputs = document.createElement('div');
    service_inputs.className = 'service_inputs';

    const service_list_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" class="service_list_head_svg"><path d="M15.5917 6.84123C15.5142 6.76312 15.422 6.70112 15.3205 6.65882C15.2189 6.61651 15.11 6.59473 15 6.59473C14.89 6.59473 14.7811 6.61651 14.6795 6.65882C14.578 6.70112 14.4858 6.76312 14.4083 6.84123L10.5917 10.6579C10.5142 10.736 10.422 10.798 10.3205 10.8403C10.2189 10.8826 10.11 10.9044 10 10.9044C9.89 10.9044 9.78108 10.8826 9.67953 10.8403C9.57798 10.798 9.48581 10.736 9.40834 10.6579L5.59168 6.84123C5.51421 6.76312 5.42204 6.70112 5.32049 6.65882C5.21894 6.61651 5.11002 6.59473 5.00001 6.59473C4.89 6.59473 4.78108 6.61651 4.67953 6.65882C4.57798 6.70112 4.48581 6.76312 4.40834 6.84123C4.25313 6.99736 4.16602 7.20857 4.16602 7.42873C4.16602 7.64888 4.25313 7.86009 4.40834 8.01623L8.23334 11.8412C8.70209 12.3094 9.33751 12.5724 10 12.5724C10.6625 12.5724 11.2979 12.3094 11.7667 11.8412L15.5917 8.01623C15.7469 7.86009 15.834 7.64888 15.834 7.42873C15.834 7.20857 15.7469 6.99736 15.5917 6.84123Z"/></svg>';

    const main_btn = document.createElement('button');
    main_btn.type = 'button';
    main_btn.id = element.id;
    main_btn.name = element.id;
    main_btn.innerText = element.value[0].value;
    main_btn.value = element.value[0].value;
    main_btn.className = 'service_list_head_btn';
    main_btn.innerHTML += service_list_svg;

    const service_list_div = document.createElement('div');
    service_list_div.className = 'service_list_div';
    service_list_div.hidden = true;

    identificators[element.id] = {
        name: element.name,
        price: element.price,
        isOneGetService: element.isOneGetService,
        elem_type: 'list',
        isAdditionalService: element.isAdditionalService,
        list_elems: {}
    }

    element.value.map((ser_btn) => {
        const service_btn = document.createElement('button');
        service_btn.type = 'button';
        service_list_div.appendChild(service_btn);
        service_btn.className = 'service_list_btn_selector';
        service_btn.innerText = ser_btn.value;
        service_btn.onclick = () => {
            main_btn.value = ser_btn.value;
            identificators[main_btn.id].price = ser_btn.price
            main_btn.innerHTML = ser_btn.value;
            main_btn.innerHTML += service_list_svg;
            identificators[main_btn.id].list_elems[ser_btn.value] = ser_btn.price;
            main_btn.click();
            countCart();
        }
    })

    main_btn.onclick = () => {
        if (service_list_div.hidden === true) {
            service_list_div.hidden = false;
            return;
        }
        service_list_div.hidden = true;
    };
    
    service_inputs.appendChild(main_btn);
    service_inputs.appendChild(service_list_div);

    return service_inputs;
};

// Создание селектора "Статическое значение"
function createSelectorStatic(element) {
    const service_inputs = document.createElement('div');
    service_inputs.className = 'service_inputs';

    const input = document.createElement('input');
    input.className = 'service_static';
    input.type = 'text';
    input.readOnly = true;
    input.value = element.value;
    input.id = element.id;

    service_inputs.appendChild(input);
    
    identificators[element.id] = {
        name: element.name,
        price: element.price,
        isOneGetService: element.isOneGetService,
        elem_type: 'static',
        isAdditionalService: element.isAdditionalService
    }
    return service_inputs;
};

// Добавление блоков с селекторами, с помощью которых будет осуществляться заказ
function addPageSelectors(element, counter) {
    const left_elem = document.getElementById('left');

    // Создаем блок, в котором будут храниться все селекторы
    const block = document.createElement('div');
    block.id = 'block_' + counter;
    block.setAttribute('name', element.name);
    left_elem.appendChild(block);

    // Проверяем и добавляем при наличии кнопку для отображения шаблонов
    if (element.templates.length) {
        const btn_show_templates = document.createElement('button');
        btn_show_templates.type = 'button';
        btn_show_templates.className = 'btn_show_templates';
        btn_show_templates.innerText = 'Рекомендуемые параметры';
        block.appendChild(btn_show_templates);

        btn_show_templates.onclick = () => {
            showTemplates(element.templates);
        }
    }

    // Далее будет создание и добавление селекторов
    element.params.map( e => {
        const service = document.createElement('div');
        service.className = 'service';

        const service_description = document.createElement('div');
        service_description.className = 'service_description';

        const service_description_p = document.createElement('p');
        service_description_p.innerText = e.name;

        const service_description_btn = document.createElement('button');
        service_description_btn.type = 'button';
        service_description_btn.className = 'service_description_btn';
        service_description_btn.title = 'Click me';
        service_description_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" class="service_img">
            <g clip-path="url(#clip0_2280_279)">
                <path d="M7 0C5.61553 0 4.26216 0.410543 3.11101 1.17971C1.95987 1.94888 1.06266 3.04213 0.532846 4.32122C0.003033 5.6003 -0.13559 7.00777 0.134506 8.36563C0.404603 9.7235 1.07129 10.9708 2.05026 11.9497C3.02922 12.9287 4.2765 13.5954 5.63437 13.8655C6.99224 14.1356 8.3997 13.997 9.67879 13.4672C10.9579 12.9373 12.0511 12.0401 12.8203 10.889C13.5895 9.73785 14 8.38447 14 7C13.998 5.1441 13.2599 3.36479 11.9475 2.05247C10.6352 0.74015 8.8559 0.0020073 7 0ZM7 12.8333C5.84628 12.8333 4.71846 12.4912 3.75918 11.8502C2.79989 11.2093 2.05222 10.2982 1.61071 9.23232C1.16919 8.16642 1.05368 6.99353 1.27876 5.86197C1.50384 4.73042 2.05941 3.69102 2.87521 2.87521C3.69102 2.0594 4.73042 1.50383 5.86198 1.27875C6.99353 1.05367 8.16642 1.16919 9.23232 1.6107C10.2982 2.05221 11.2093 2.79989 11.8502 3.75917C12.4912 4.71846 12.8333 5.84628 12.8333 7C12.8316 8.54658 12.2165 10.0293 11.1229 11.1229C10.0293 12.2165 8.54658 12.8316 7 12.8333Z"/>
                <path d="M7.41827 2.95381C7.08188 2.89252 6.73613 2.90591 6.40548 2.99303C6.07484 3.08016 5.76738 3.23888 5.50488 3.45798C5.24237 3.67709 5.03122 3.9512 4.88638 4.26094C4.74153 4.57068 4.66653 4.90846 4.66669 5.25039C4.66669 5.4051 4.72815 5.55347 4.83754 5.66287C4.94694 5.77227 5.09531 5.83372 5.25002 5.83372C5.40473 5.83372 5.5531 5.77227 5.6625 5.66287C5.7719 5.55347 5.83335 5.4051 5.83335 5.25039C5.83321 5.07876 5.87093 4.90921 5.94383 4.75383C6.01674 4.59845 6.12302 4.46108 6.25511 4.35149C6.38721 4.24191 6.54185 4.16282 6.70802 4.11986C6.87419 4.0769 7.04779 4.07114 7.21644 4.10297C7.44688 4.14771 7.65875 4.26012 7.825 4.42584C7.99125 4.59157 8.10432 4.80309 8.14977 5.03339C8.19568 5.27513 8.16398 5.52519 8.05921 5.74782C7.95444 5.97046 7.78196 6.15427 7.56644 6.27297C7.20954 6.47975 6.91461 6.77844 6.71239 7.13794C6.51017 7.49744 6.40806 7.90459 6.41669 8.31697V8.75039C6.41669 8.9051 6.47815 9.05347 6.58754 9.16287C6.69694 9.27227 6.84531 9.33372 7.00002 9.33372C7.15473 9.33372 7.3031 9.27227 7.4125 9.16287C7.5219 9.05347 7.58335 8.9051 7.58335 8.75039V8.31697C7.57603 8.11398 7.62232 7.91264 7.71756 7.73323C7.8128 7.55381 7.95362 7.40266 8.12585 7.29497C8.54849 7.06285 8.88883 6.70549 9.10007 6.27204C9.31131 5.8386 9.38309 5.35035 9.30552 4.87445C9.22795 4.39854 9.00485 3.95836 8.66689 3.61443C8.32894 3.2705 7.89274 3.03971 7.41827 2.95381Z"/>
                <path d="M7.58335 10.5003C7.58335 10.1782 7.32219 9.91699 7.00002 9.91699C6.67785 9.91699 6.41669 10.1782 6.41669 10.5003C6.41669 10.8225 6.67785 11.0837 7.00002 11.0837C7.32219 11.0837 7.58335 10.8225 7.58335 10.5003Z"/>
            </g>
            <defs>
                <clipPath id="clip0_2280_279">
                    <rect width="14" height="14"/>
                </clipPath>
            </defs>
        </svg>`
        service_description_btn.onmouseover = () => {
            const help_block = document.getElementById('help_block');
            const help_title = document.getElementById('help_title');
            const help_description = document.getElementById('help_description');

            help_block.hidden = false;

            help_title.innerText = e.name;
            help_description.innerText = e.description;
        }
        service_description_btn.onmouseout = () => {
            if ((help_block.getAttribute('isClicked')) === 'false') {
                help_block.hidden = true;
            }
        }

        service_description_btn.onclick = () => {
            const help_block = document.getElementById('help_block');
            const help_title = document.getElementById('help_title');
            const help_description = document.getElementById('help_description');

            help_block.hidden = false;

            help_title.innerText = e.name;
            help_description.innerText = e.description;

            help_block.setAttribute('isClicked', 'true');
        }

        block.appendChild(service);
        service.appendChild(service_description);
        service_description.appendChild(service_description_p);
        service_description.appendChild(service_description_btn);

        let service_inputs = false;
        if (e.type === 'checkbox') {
            service_inputs = createSelectorCheckbox(e);
        } else if (e.type === 'slider') {
            service_inputs = createSelectorSlider(e);
        } else if (e.type === 'list') {
            service_inputs = createSelectorList(e);
        } else if (e.type === 'named_slider') {
            service_inputs = createSelectorNamedSlider(e);
        } else if (e.type === 'static') {
            service_inputs = createSelectorStatic(e);
        }
        
        if (!(service_inputs)) {
            console.error('Field "type" is not valid');
            console.log(e);
        }
        service.appendChild(service_inputs);

    });

    const temp_div = document.createElement('div');
    block.appendChild(temp_div);
    temp_div.className = 'div_to_cart';

    const btn_add_to_cart = document.createElement('button');
    temp_div.appendChild(btn_add_to_cart);
    btn_add_to_cart.className = 'btn_add_to_cart';
    btn_add_to_cart.setAttribute('onclick', 'toCart("' + 'block_' + counter + '")')
    btn_add_to_cart.innerText = 'В корзину';
};

// Добавляет услугу в корзину с выбранными сервисами
function toCart(id) {
    if (cart.indexOf(id) != -1) {
        return
    }
    
    cart.push(id);
    countCart();
};

// Отображение шаблонов, которые имеются в услуге
function showTemplates(configs) {
    const body = document.body;
    body.style = 'overflow: hidden;'

    const fixed_background = document.getElementById('fixed_background');
    fixed_background.hidden = false; 

    const templates_div = document.createElement('div');
    templates_div.className = 'templates';
    templates_div.id = 'templates';
    fixed_background.appendChild(templates_div);

    const close_templates = document.createElement('button');
    close_templates.type = 'button';
    templates_div.appendChild(close_templates);
    close_templates.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" class="close_templates_svg"><path d="M11.7674 10.0003L14.9999 6.76442C15.2098 6.52589 15.321 6.21639 15.3108 5.89883C15.3007 5.58128 15.17 5.2795 14.9454 5.05484C14.7207 4.83018 14.4189 4.6995 14.1014 4.68936C13.7838 4.67922 13.4743 4.79039 13.2358 5.00026L9.99994 8.23276L6.75828 4.99026C6.64216 4.87415 6.50432 4.78204 6.35262 4.7192C6.20091 4.65637 6.03831 4.62402 5.87411 4.62402C5.7099 4.62402 5.54731 4.65637 5.3956 4.7192C5.2439 4.78204 5.10605 4.87415 4.98994 4.99026C4.87383 5.10637 4.78173 5.24421 4.71889 5.39592C4.65605 5.54762 4.62371 5.71022 4.62371 5.87442C4.62371 6.03863 4.65605 6.20123 4.71889 6.35293C4.78173 6.50464 4.87383 6.64248 4.98994 6.75859L8.23244 10.0003L4.99994 13.2353C4.87317 13.3486 4.77085 13.4866 4.69924 13.6408C4.62764 13.795 4.58825 13.9622 4.5835 14.1322C4.57874 14.3022 4.60871 14.4714 4.67158 14.6293C4.73445 14.7873 4.82889 14.9308 4.94912 15.0511C5.06936 15.1713 5.21286 15.2658 5.37086 15.3286C5.52885 15.3915 5.698 15.4215 5.86798 15.4167C6.03795 15.4119 6.20517 15.3726 6.35939 15.301C6.51362 15.2293 6.65162 15.127 6.76494 15.0003L9.99994 11.7678L13.2316 15.0003C13.4661 15.2348 13.7841 15.3665 14.1158 15.3665C14.4474 15.3665 14.7654 15.2348 14.9999 15.0003C15.2344 14.7658 15.3662 14.4477 15.3662 14.1161C15.3662 13.7845 15.2344 13.4664 14.9999 13.2319L11.7674 10.0003Z"/></svg>';
    close_templates.className = 'btn_close_templates';
    close_templates.onclick = () => {
        templates_div.remove();
        body.style = 'overflow: visible;';
        fixed_background.hidden = true; 
    };
    
    configs.map(config => {
        
        // Создаем карточку, в которой будут распологаться параметры шаблона
        const card = document.createElement('div');
        card.className = 'template_card';

        templates_div.appendChild(card);

        const card_title = document.createElement('h3');
        card_title.className = 'template_card_title';
        card_title.innerHTML = config.name;
        card.appendChild(card_title);

        let cardPrice = 0;

        config.params.map(param => {
            const param_line = document.createElement('div');
            param_line.className = 'template_param_line';
            card.appendChild(param_line);

            const param_name = document.createElement('p');
            param_name.className = 'template_param_name';
            param_line.appendChild(param_name);
            param_name.innerText = identificators[param.id_text_param].name;

            const param_value = document.createElement('p');
            param_value.className = 'template_param_value';
            param_line.appendChild(param_value);
            param_value.innerText = 'x' + param.value;

            cardPrice += identificators[param.id_text_param].price * param.value / 6
        });

        const template_card_price = document.createElement('p');
        template_card_price.className = 'template_card_price';
        template_card_price.innerHTML = cardPrice.toFixed(2) + ' &#8381;/мес';
        card.appendChild(template_card_price);

        const template_card_btn = document.createElement('button');
        template_card_btn.type = 'button';
        template_card_btn.className = 'template_card_btn';
        template_card_btn.innerText = 'Выбрать';
        card.appendChild(template_card_btn);

        template_card_btn.onclick = () => {
            templates_div.remove();
            body.style = 'overflow: visible;';
            fixed_background.hidden = true;

            config.params.map(param => {
                if (identificators[param.id_text_param].elem_type === 'slider') {
                    document.getElementById(param.id_text_param).value = param.value;
                    document.getElementById(param.id_text_param + '_slider').value = param.value;

                } else if (identificators[param.id_text_param].elem_type === 'checkbox') {
                    const checkbox_hidden = document.getElementById(param.id_text_param) + '_hidden';
                    const checkbox = document.getElementById(param.id_text_param);

                    if (param.value) {
                        checkbox_hidden.checked = true;
                        checkbox.className = 'service_checkbox_checked';
                    }

                } else if (identificators[param.id_text_param].elem_type === 'named_slider') {
                    let ar = identificators[param.id_text_param].named_slider_values;
                    document.getElementById(param.id_text_param).value = param.value;
                    document.getElementById(param.id_text_param + '_slider').value = ar.indexOf(parseInt(param.value));
                }
                
            });
            countCart();
        };

    });

};

// Отображение формы с оформлением заказа
function showOrdering() {
    const body = document.body;
    body.style = 'overflow: hidden;'

    const fixed_background = document.getElementById('fixed_background');
    fixed_background.hidden = false; 

    const order_div = document.createElement('div');
    order_div.className = 'orders';
    order_div.id = 'orders';
    fixed_background.appendChild(order_div);

    const order_header = document.createElement('h2');
    order_header.className = 'order_header';
    order_header.innerText = 'Оформление заказа'
    order_div.appendChild(order_header);


    const close_order = document.createElement('button');
    close_order.type = 'button';
    order_div.appendChild(close_order);
    close_order.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" class="close_templates_svg"><path d="M11.7674 10.0003L14.9999 6.76442C15.2098 6.52589 15.321 6.21639 15.3108 5.89883C15.3007 5.58128 15.17 5.2795 14.9454 5.05484C14.7207 4.83018 14.4189 4.6995 14.1014 4.68936C13.7838 4.67922 13.4743 4.79039 13.2358 5.00026L9.99994 8.23276L6.75828 4.99026C6.64216 4.87415 6.50432 4.78204 6.35262 4.7192C6.20091 4.65637 6.03831 4.62402 5.87411 4.62402C5.7099 4.62402 5.54731 4.65637 5.3956 4.7192C5.2439 4.78204 5.10605 4.87415 4.98994 4.99026C4.87383 5.10637 4.78173 5.24421 4.71889 5.39592C4.65605 5.54762 4.62371 5.71022 4.62371 5.87442C4.62371 6.03863 4.65605 6.20123 4.71889 6.35293C4.78173 6.50464 4.87383 6.64248 4.98994 6.75859L8.23244 10.0003L4.99994 13.2353C4.87317 13.3486 4.77085 13.4866 4.69924 13.6408C4.62764 13.795 4.58825 13.9622 4.5835 14.1322C4.57874 14.3022 4.60871 14.4714 4.67158 14.6293C4.73445 14.7873 4.82889 14.9308 4.94912 15.0511C5.06936 15.1713 5.21286 15.2658 5.37086 15.3286C5.52885 15.3915 5.698 15.4215 5.86798 15.4167C6.03795 15.4119 6.20517 15.3726 6.35939 15.301C6.51362 15.2293 6.65162 15.127 6.76494 15.0003L9.99994 11.7678L13.2316 15.0003C13.4661 15.2348 13.7841 15.3665 14.1158 15.3665C14.4474 15.3665 14.7654 15.2348 14.9999 15.0003C15.2344 14.7658 15.3662 14.4477 15.3662 14.1161C15.3662 13.7845 15.2344 13.4664 14.9999 13.2319L11.7674 10.0003Z"/></svg>';
    close_order.className = 'btn_close_templates';
    close_order.onclick = () => {
        order_div.remove();
        body.style = 'overflow: visible;';
        fixed_background.hidden = true; 
    };

    // Поля, которые будут спрашиваться у пользователя
    const fields = [
        {placeholder: 'ФИО', type: 'text', id: 'order_name'},
        {placeholder: 'E-mail', type: 'email', id: 'order_email'},
        {placeholder: 'Телефон', type: 'text', id: 'order_phone'}
    ];

    fields.map(field => {
        const div = document.createElement('div');
        order_div.appendChild(div);


        const input = document.createElement('input');
        input.className = 'order_input';
        input.required = true;
        input.placeholder = field.placeholder;
        input.type = field.type;
        input.id = field.id;
        div.appendChild(input);

    });

    const submit = document.createElement('button');
    submit.type = 'button';
    order_div.appendChild(submit);
    submit.className = 'submit_order';
    submit.innerText = 'Отправить';

    submit.onclick = () => {

        let fields_full = true;
        fields.map(e => {
            const elem = document.getElementById(e.id);
            if (elem.value === '') {
                elem.style = 'border: 1px solid #F08080;'
                setTimeout(() => {
                    elem.style = 'border: 1px solid #eee;'
                }, 500)
                fields_full = false;
            }
        });
        
        if (!fields_full) return;

        createOrder(
            username = document.getElementById('order_name').value,
            phone = document.getElementById('order_phone').value,
            email = document.getElementById('order_email').value
        )

        order_div.remove();
        body.style = 'overflow: visible;';
        fixed_background.hidden = true; 
    };
    
    // Устанавливаем маску для телефона
    IMask(document.getElementById('order_phone'), {mask: '+{7} (000) 000-00-00'})

}

function createOrder(username, phone, email) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const ticket_sum = document.getElementById('ticket_sum').innerText.slice(0,-6);

    let order_params = {};

    cart.map( e => {
        let multiply = 0;

        // Собираем все слайдеры, которые отображены в блоках, которые положены в карзину
        const inputs = document.querySelectorAll('#' + e + ' .service_slider_numbers');
        const checkboxs = document.querySelectorAll('#' + e + ' .service_checkbox_hidden');
        const lists = document.querySelectorAll('#' + e + ' .service_list_head_btn');
        const statics = document.querySelectorAll('#' + e + ' .service_static');

        let ticket_config              = []; // Список с конфигурациями
        let ticket_additionalService   = []; // Список с доп. услугами
        let ticket_gift                = []; // Список с бонусами
        
        // Для распределения параметров в чеке
        function distributeServiceInTicket(idi, value) {
            const elementik = document.getElementById(idi);
            // console.log(elementik.checked);
            // console.log(identificators[idi]);
            if (!identificators[idi].isAdditionalService && identificators[idi].price * value !== 0) {
                if (value === 'on') value = elementik.checked ? 'Да' : 'Нет';
                ticket_config.push({
                    name: identificators[idi].name,
                    value: value
                });
            } else if (identificators[idi].isAdditionalService && identificators[idi].price * value !== 0){
                if (value === 'on') value = elementik.checked ? 'Да' : 'Нет';
                ticket_additionalService.push({
                    name: identificators[idi].name,
                    value: value
                });
            }
        };

        // Проверяем возможность бонуса
        function checkGift(id, value) {
            const iden = identificators[id]

            if (iden.isTwoByOne && value <= iden.twoByOneValue && parseInt(value) !== 0) {
                ticket_gift.push({
                    name: iden.name,
                    value: value
                });
            } else if (iden.isTwoByOne && value > iden.twoByOneValue && parseInt(value) !== 0) {
                ticket_gift.push({
                    name: iden.name,
                    value: iden.twoByOneValue
                });
            }
        }

        [inputs, checkboxs, lists, statics].map( els => {
            els.forEach( inp => {
                // console.log(inp.id);
                if (inp.getAttribute('inherit_by') === '*') {
                    multiply += inp.value;
                } else {
                    distributeServiceInTicket(inp.id, inp.value);
                    checkGift(inp.id, inp.value);
                }
            });
        });

        const block_name = document.getElementById(e).getAttribute('name')
        order_params[block_name] = {}
        order_params[block_name]['multiply'] = parseInt(multiply);
        order_params[block_name]['ticket_config'] = ticket_config;
        order_params[block_name]['ticket_additionalService'] = ticket_additionalService;
        order_params[block_name]['ticket_gift'] = ticket_gift;

    });

    let order = {
        'name': username,
        'phone': phone,
        'email': email,
        'ticket_sum': ticket_sum,
        'order_params': order_params
    }

    fetch(window.location.href + 'api/createOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(order)
    });
}

// Подсчет услуг, которые были добавлены в корзину
function countCart() {
    let sumPrice = 0; // Сумма всех услуг

    const ticket_lines = document.getElementById('ticket_lines');
    ticket_lines.innerHTML = '';

    // Скрываем чек и показываем что корзина пуста, если она пуста
    if (!(cart.length)) {
        document.getElementById('empty_ticket').hidden = false;
        document.getElementById('ticket').hidden = true;
        document.getElementById('helper').hidden = true;
    } else {
        document.getElementById('empty_ticket').hidden = true;
        document.getElementById('ticket').hidden = false;
        document.getElementById('helper').hidden = false;
    }

    let counter = 0;
    cart.map( function(e) {
        let servicePrice = 0; // Суммарная стоимость 1 услуги
        let multiply = 0; // На сколько будет умножаться суммарная стоимость 1 услуги

        // Собираем все слайдеры, которые отображены в блоках, которые положены в карзину
        const inputs = document.querySelectorAll('#' + e + ' .service_slider_numbers');
        const checkboxs = document.querySelectorAll('#' + e + ' .service_checkbox_hidden');
        const lists = document.querySelectorAll('#' + e + ' .service_list_head_btn');
        const statics = document.querySelectorAll('#' + e + ' .service_static');

        let ticket_config              = []; // Список с конфигурациями
        let ticket_additionalService   = []; // Список с доп. услугами
        let ticket_gift                = []; // Список с бонусами

        // Для распределения параметров в чеке
        function distributeServiceInTicket(id, value) {
            if (!identificators[id].isAdditionalService && identificators[id].price * value !== 0) {
                if (value === 'on') value = 'Да';
                ticket_config.push({
                    name: identificators[id].name,
                    value: value
                });
            } else if (identificators[id].isAdditionalService && identificators[id].price * value !== 0){
                if (value === 'on') value = 'Да';
                ticket_additionalService.push({
                    name: identificators[id].name,
                    value: value
                });
            }
        };

        // Проверяем возможность бонуса
        function checkGift(id, value) {
            const iden = identificators[id]

            if (iden.isTwoByOne && value <= iden.twoByOneValue && parseInt(value) !== 0) {
                ticket_gift.push({
                    name: iden.name,
                    value: value
                });
            } else if (iden.isTwoByOne && value > iden.twoByOneValue && parseInt(value) !== 0) {
                ticket_gift.push({
                    name: iden.name,
                    value: iden.twoByOneValue
                });
            }
        }

        inputs.forEach( function(e_input) {
            if (e_input.getAttribute('inherit_by') === '*') {
                multiply += e_input.value;
            } else {
                let e_price = identificators[e_input.id].price;
                if (identificators[e_input.id].isOneGetService === true) {
                    servicePrice += e_price * e_input.value;
                } else {
                    servicePrice += e_price * e_input.value / 6;
                }
                
                distributeServiceInTicket(e_input.id, e_input.value);
                checkGift(e_input.id, e_input.value);
            }
            
        })

        checkboxs.forEach( function(e_check) {
            if (e_check.checked === true) {
                let e_price = identificators[e_check.id].price;
                if (identificators[e_check.id].isOneGetService === true) {
                    servicePrice += e_price * 1;
                } else {
                    servicePrice += e_price * 1 / 6;
                }
                
                distributeServiceInTicket(e_check.id, e_check.value);
            }
        })

        lists.forEach( function(e_list) {
            let e_price = identificators[e_list.id].price;
            if (identificators[e_list.id].isOneGetService === true) {
                servicePrice += e_price * 1;
            } else {
                servicePrice += e_price * 1 / 6;
            }
                
            distributeServiceInTicket(e_list.id, e_list.value);
        })

        //service_static
        statics.forEach( function(e_static) {
            let e_price = identificators[e_static.id].price;
            if (identificators[e_static.id].isOneGetService === true) {
                servicePrice += e_price * 1;
            } else {
                servicePrice += e_price * e_static.value / 6;
            }
                
            distributeServiceInTicket(e_static.id, e_static.value);
        })

        let a = '';
        if (multiply !== 0) {
            servicePrice = servicePrice * multiply;
            a = '<span class="ticket_multiply"> x' + parseInt(multiply) + '</span>';
        }

        sumPrice += servicePrice;

        // отображаем чек
        const ticket_line = document.createElement('div');
        ticket_lines.appendChild(ticket_line);
        ticket_line.className = 'ticket_line';

        const ticket_line_2 = document.createElement('div');
        ticket_line.appendChild(ticket_line_2);
        ticket_line_2.className = 'ticket_line_block_header';

        const ticket_line_3 = document.createElement('div');
        ticket_line.appendChild(ticket_line_3);
        ticket_line_3.className = 'ticket_line_block';

        const block_header = document.createElement('h4');
        block_header.className = 'ticket_desc_title';
        ticket_line_3.appendChild(block_header);
        block_header.innerText = 'Конфигурация';

        ticket_config.map(conf => {

            const block_p = document.createElement('div');
            block_p.className = 'ticket_desc_params_block';
            ticket_line_3.appendChild(block_p);

            const aa = document.createElement('p');
            block_p.appendChild(aa);
            aa.className = 'ticket_desc_params';
            aa.innerText = conf.name;

            const ab = document.createElement('p');
            block_p.appendChild(ab);
            ab.className = 'ticket_desc_params';
            ab.innerText = 'x' + conf.value;
        });

        if (ticket_additionalService.length !== 0) {
            const block_header_2 = document.createElement('h4');
            block_header_2.className = 'ticket_desc_title';
            ticket_line_3.appendChild(block_header_2);
            block_header_2.innerText = 'Дополнительные услуги';

            ticket_additionalService.map(conf => {

                const block_p = document.createElement('div');
                block_p.className = 'ticket_desc_params_block';
                ticket_line_3.appendChild(block_p);

                const aa = document.createElement('p');
                block_p.appendChild(aa);
                aa.className = 'ticket_desc_params';
                aa.innerText = conf.name;

                const ab = document.createElement('p');
                block_p.appendChild(ab);
                ab.className = 'ticket_desc_params';
                ab.innerText = conf.value;
            });
        }

        if (ticket_gift.length !== 0) {
            const block_header_3 = document.createElement('h4');
            block_header_3.className = 'ticket_desc_title';
            ticket_line_3.appendChild(block_header_3);
            block_header_3.innerText = 'Бонус';

            ticket_gift.map(conf => {

                const block_p = document.createElement('div');
                block_p.className = 'ticket_desc_params_block';
                ticket_line_3.appendChild(block_p);

                const aa = document.createElement('p');
                block_p.appendChild(aa);
                aa.className = 'ticket_desc_params';
                aa.innerText = conf.name;

                const ab = document.createElement('p');
                block_p.appendChild(ab);
                ab.className = 'ticket_desc_params';
                ab.innerText = conf.value;
            });
        }

        const arrow_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" class="ticket_svg_arrow"><path d="M15.5917 6.84123C15.5142 6.76312 15.422 6.70112 15.3205 6.65882C15.2189 6.61651 15.11 6.59473 15 6.59473C14.89 6.59473 14.7811 6.61651 14.6795 6.65882C14.578 6.70112 14.4858 6.76312 14.4083 6.84123L10.5917 10.6579C10.5142 10.736 10.422 10.798 10.3205 10.8403C10.2189 10.8826 10.11 10.9044 10 10.9044C9.89 10.9044 9.78108 10.8826 9.67953 10.8403C9.57798 10.798 9.48581 10.736 9.40834 10.6579L5.59168 6.84123C5.51421 6.76312 5.42204 6.70112 5.32049 6.65882C5.21894 6.61651 5.11002 6.59473 5.00001 6.59473C4.89 6.59473 4.78108 6.61651 4.67953 6.65882C4.57798 6.70112 4.48581 6.76312 4.40834 6.84123C4.25313 6.99736 4.16602 7.20857 4.16602 7.42873C4.16602 7.64888 4.25313 7.86009 4.40834 8.01623L8.23334 11.8412C8.70209 12.3094 9.33751 12.5724 10 12.5724C10.6625 12.5724 11.2979 12.3094 11.7667 11.8412L15.5917 8.01623C15.7469 7.86009 15.834 7.64888 15.834 7.42873C15.834 7.20857 15.7469 6.99736 15.5917 6.84123Z"></path></svg>';

        const ticket_line_desc = document.createElement('p');
        ticket_line_2.appendChild(ticket_line_desc);
        ticket_line_desc.className = 'ticket_line_desc';
        ticket_line_desc.innerHTML = arrow_icon + document.getElementById(e).getAttribute('name') + a;
        ticket_line_desc.id = 'ti_' + counter
        counter++;

        ticket_line_3.hidden = true;

        ticket_line_desc.onclick = () => {
            if (ticket_line_3.hidden) {
                ticket_line_3.style = 'display: block;'
                ticket_line_3.hidden = false;
                showedTickets.push(ticket_line_desc.id)
            } else {
                ticket_line_3.style = 'display: none;'
                ticket_line_3.hidden = true;
                let new_arr = [];
                showedTickets.forEach( (e) => {
                    if ( !(e === ticket_line_desc.id) ) {
                        new_arr.push(e);
                    }
                })

                showedTickets = new_arr;
                countCart();
            }
        }

        if (showedTickets.indexOf(ticket_line_desc.id) > -1) {
            ticket_line_3.style = 'display: block;'
            ticket_line_3.hidden = false;
            showedTickets.push(ticket_line_desc.id)
        }

        const ticket_summary = document.createElement('div');
        ticket_line_2.appendChild(ticket_summary);
        ticket_summary.className = 'ticket_summary';

        const ticket_line_sum = document.createElement('p');
        ticket_summary.appendChild(ticket_line_sum);
        ticket_line_sum.className = 'ticket_line_sum';
        ticket_line_sum.innerHTML = (servicePrice).toFixed(2) + ' &#8381;/мес';

        const ticket_summary_btn = document.createElement('button');
        ticket_summary.appendChild(ticket_summary_btn);
        ticket_summary_btn.className = 'ticket_btn_del';
        ticket_summary_btn.setAttribute('name', e);
        ticket_summary_btn.onclick = () => {
            new_arr = [];
            cart.forEach( (e) => {
                if ( !(e === ticket_summary_btn.getAttribute('name')) ) {
                    new_arr.push(e);
                }
            })

            cart = new_arr;
            countCart();
        }
        ticket_summary_btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" class="delete_ticket_line"><path d="M11.7674 10.0003L14.9999 6.76442C15.2098 6.52589 15.321 6.21639 15.3108 5.89883C15.3007 5.58128 15.17 5.2795 14.9454 5.05484C14.7207 4.83018 14.4189 4.6995 14.1014 4.68936C13.7838 4.67922 13.4743 4.79039 13.2358 5.00026L9.99994 8.23276L6.75828 4.99026C6.64216 4.87415 6.50432 4.78204 6.35262 4.7192C6.20091 4.65637 6.03831 4.62402 5.87411 4.62402C5.7099 4.62402 5.54731 4.65637 5.3956 4.7192C5.2439 4.78204 5.10605 4.87415 4.98994 4.99026C4.87383 5.10637 4.78173 5.24421 4.71889 5.39592C4.65605 5.54762 4.62371 5.71022 4.62371 5.87442C4.62371 6.03863 4.65605 6.20123 4.71889 6.35293C4.78173 6.50464 4.87383 6.64248 4.98994 6.75859L8.23244 10.0003L4.99994 13.2353C4.87317 13.3486 4.77085 13.4866 4.69924 13.6408C4.62764 13.795 4.58825 13.9622 4.5835 14.1322C4.57874 14.3022 4.60871 14.4714 4.67158 14.6293C4.73445 14.7873 4.82889 14.9308 4.94912 15.0511C5.06936 15.1713 5.21286 15.2658 5.37086 15.3286C5.52885 15.3915 5.698 15.4215 5.86798 15.4167C6.03795 15.4119 6.20517 15.3726 6.35939 15.301C6.51362 15.2293 6.65162 15.127 6.76494 15.0003L9.99994 11.7678L13.2316 15.0003C13.4661 15.2348 13.7841 15.3665 14.1158 15.3665C14.4474 15.3665 14.7654 15.2348 14.9999 15.0003C15.2344 14.7658 15.3662 14.4477 15.3662 14.1161C15.3662 13.7845 15.2344 13.4664 14.9999 13.2319L11.7674 10.0003Z"/></svg>'
    });

    document.getElementById('ticket_sum').innerHTML = (sumPrice).toFixed(2) + ' &#8381;/мес';
};