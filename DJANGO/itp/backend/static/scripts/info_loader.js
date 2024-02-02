const start_url = window.location.href;
let isDataLoaded = false;

let usedServices = [];

let dictionary = {};

loadServices();

function loadServices() { // Ф-я загрузки списка услуг
    fetch(start_url + '/api/services')
        .then(function (response) {

            if (!(response.ok)) {
                document.getElementById('container').innerHTML = ''
                return;
            }

            response.text().then(function (text) {

                const nav_elem = document.getElementById('navigation');
                const service_desc = document.getElementById('service_desc');
                
                let data = JSON.parse(text); // Парсим полученный JSON
                data.result.map(element => {
                    // Проходимся по каждому элементу в массиве, создаем кнопку и добавляем её в список услуг
                    let btn = document.createElement('button');
                    btn.value = element.name;
                    btn.className = 'nav_link';
                    btn.type = 'button';
                    btn.innerText = element.name;
                    btn.onclick = () => {
                        selectNavBtn(btn);
                        if (element.description.length !== 0) {
                            service_desc.hidden = false;
                            service_desc.innerText = element.description
                        } else {
                            service_desc.hidden = true;
                        }
                    }

                    nav_elem.appendChild(btn);
                    
                });
                // Окрашиваем 1 элемент (показываем его как текущий)
                nav_elem.firstElementChild.click();
                
            });
        });
}

function selectNavBtn(elem) { // Загрузка услуг
    // Первым делом очищаем все остальные кнопки, от стиля выделения и окрашиваем нажатую
    const nav_elem = document.querySelectorAll('.nav_link');

    const left_elem = document.getElementById('left');

    let counter = 1;

    if (isDataLoaded === false) {
        isDataLoaded = true;
        left_elem.innerHTML = '';

        nav_elem.forEach(function(e) {
            
            const url = start_url + '/api/params?' + new URLSearchParams({param: e.value});
            
            e.setAttribute('block_id', counter);

            const block = document.createElement('div');
            left_elem.appendChild(block);
            block.id = 'block_' + counter;
            block.setAttribute('name', e.value);

            fetch(url)
                .then ( function (response) {
                    response.text().then( function (text) {
                        let data = JSON.parse(text).result;

                        data.map(element => {
                            const service = document.createElement('div');
                            block.appendChild(service)
                            service.className = 'service';

                            const service_description = document.createElement('div');
                            service.appendChild(service_description);
                            service_description.className = 'service_description';

                            const service_description_p = document.createElement('p');
                            service_description.appendChild(service_description_p);
                            service_description_p.innerText = element.name;

                            const service_description_btn = document.createElement('button');
                            service_description.appendChild(service_description_btn);
                            service_description_btn.type = 'button';
                            service_description_btn.className = 'service_description_btn';
                            service_description_btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" class="service_img"><g clip-path="url(#clip0_2280_279)"><path d="M7 0C5.61553 0 4.26216 0.410543 3.11101 1.17971C1.95987 1.94888 1.06266 3.04213 0.532846 4.32122C0.003033 5.6003 -0.13559 7.00777 0.134506 8.36563C0.404603 9.7235 1.07129 10.9708 2.05026 11.9497C3.02922 12.9287 4.2765 13.5954 5.63437 13.8655C6.99224 14.1356 8.3997 13.997 9.67879 13.4672C10.9579 12.9373 12.0511 12.0401 12.8203 10.889C13.5895 9.73785 14 8.38447 14 7C13.998 5.1441 13.2599 3.36479 11.9475 2.05247C10.6352 0.74015 8.8559 0.0020073 7 0ZM7 12.8333C5.84628 12.8333 4.71846 12.4912 3.75918 11.8502C2.79989 11.2093 2.05222 10.2982 1.61071 9.23232C1.16919 8.16642 1.05368 6.99353 1.27876 5.86197C1.50384 4.73042 2.05941 3.69102 2.87521 2.87521C3.69102 2.0594 4.73042 1.50383 5.86198 1.27875C6.99353 1.05367 8.16642 1.16919 9.23232 1.6107C10.2982 2.05221 11.2093 2.79989 11.8502 3.75917C12.4912 4.71846 12.8333 5.84628 12.8333 7C12.8316 8.54658 12.2165 10.0293 11.1229 11.1229C10.0293 12.2165 8.54658 12.8316 7 12.8333Z"/><path d="M7.41827 2.95381C7.08188 2.89252 6.73613 2.90591 6.40548 2.99303C6.07484 3.08016 5.76738 3.23888 5.50488 3.45798C5.24237 3.67709 5.03122 3.9512 4.88638 4.26094C4.74153 4.57068 4.66653 4.90846 4.66669 5.25039C4.66669 5.4051 4.72815 5.55347 4.83754 5.66287C4.94694 5.77227 5.09531 5.83372 5.25002 5.83372C5.40473 5.83372 5.5531 5.77227 5.6625 5.66287C5.7719 5.55347 5.83335 5.4051 5.83335 5.25039C5.83321 5.07876 5.87093 4.90921 5.94383 4.75383C6.01674 4.59845 6.12302 4.46108 6.25511 4.35149C6.38721 4.24191 6.54185 4.16282 6.70802 4.11986C6.87419 4.0769 7.04779 4.07114 7.21644 4.10297C7.44688 4.14771 7.65875 4.26012 7.825 4.42584C7.99125 4.59157 8.10432 4.80309 8.14977 5.03339C8.19568 5.27513 8.16398 5.52519 8.05921 5.74782C7.95444 5.97046 7.78196 6.15427 7.56644 6.27297C7.20954 6.47975 6.91461 6.77844 6.71239 7.13794C6.51017 7.49744 6.40806 7.90459 6.41669 8.31697V8.75039C6.41669 8.9051 6.47815 9.05347 6.58754 9.16287C6.69694 9.27227 6.84531 9.33372 7.00002 9.33372C7.15473 9.33372 7.3031 9.27227 7.4125 9.16287C7.5219 9.05347 7.58335 8.9051 7.58335 8.75039V8.31697C7.57603 8.11398 7.62232 7.91264 7.71756 7.73323C7.8128 7.55381 7.95362 7.40266 8.12585 7.29497C8.54849 7.06285 8.88883 6.70549 9.10007 6.27204C9.31131 5.8386 9.38309 5.35035 9.30552 4.87445C9.22795 4.39854 9.00485 3.95836 8.66689 3.61443C8.32894 3.2705 7.89274 3.03971 7.41827 2.95381Z"/><path d="M7.58335 10.5003C7.58335 10.1782 7.32219 9.91699 7.00002 9.91699C6.67785 9.91699 6.41669 10.1782 6.41669 10.5003C6.41669 10.8225 6.67785 11.0837 7.00002 11.0837C7.32219 11.0837 7.58335 10.8225 7.58335 10.5003Z"/></g><defs><clipPath id="clip0_2280_279"><rect width="14" height="14"/></clipPath></defs></svg>';
                            service_description_btn.onmouseover = () => {
                                const help_block = document.getElementById('help_block');
                                const help_title = document.getElementById('help_title');
                                const help_description = document.getElementById('help_description');

                                help_block.hidden = false;

                                help_title.innerText = element.name;
                                help_description.innerText = element.description;
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

                                help_title.innerText = element.name;
                                help_description.innerText = element.description;

                                help_block.setAttribute('isClicked', 'true');
                            }

                            const service_inputs = document.createElement('div');
                            service.appendChild(service_inputs)
                            service_inputs.className = 'service_inputs'
                            if (element.type === 'checkbox') {

                                let id = element.id
                                let hidden_id = element.id + '_hidden'

                                const checkbox = document.createElement('input');
                                service_inputs.appendChild(checkbox)
                                checkbox.type = 'checkbox';
                                checkbox.setAttribute('name', hidden_id);
                                checkbox.setAttribute('id', hidden_id);
                                // checkbox.setAttribute('price', element.price);
                                checkbox.setAttribute('isOneGetService', element.isOneGetService);
                                checkbox.setAttribute('elem_type', 'checkbox');
                                checkbox.hidden = true;
                                checkbox.className = 'service_checkbox_hidden';
                                dictionary[hidden_id] = {
                                    price: element.price,
                                    isOneGetService: element.isOneGetService,
                                    elem_type: 'checkbox'
                                }
                                
                                const btn = document.createElement('button');
                                service_inputs.appendChild(btn);
                                btn.type = 'button';
                                btn.className = 'service_checkbox';
                                btn.setAttribute('onclick', hidden_id + '.checked = !(' + hidden_id + '.checked); changeCheckBoxValue(this, ' + hidden_id + '); sumTicket();');
                                btn.id = id

                            } else if (element.type === 'slider') {

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
                                // input.setAttribute('price', element.price);
                                input.setAttribute('isOneGetService', element.isOneGetService);
                                input.setAttribute('elem_type', 'slider');
                                input.oninput = sumTicket();
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
                                range.setAttribute('elem_type', 'slider');
                                
                                dictionary[element.id] = {
                                    price: element.price,
                                    isOneGetService: element.isOneGetService,
                                    elem_type: 'slider'
                                }

                                range.oninput = () => {
                                    document.getElementById(element.id).value = range.value;
                                    sumTicket();
                                }
                                
                                input.setAttribute('inherit_by', ' ');

                                // Изменяем oninput для наследуемого элемента, если таковой имеется
                                if (element.inherit_by !== null && element.inherit_by !== '*') {
                                    const inherit_slider = document.getElementById(element.inherit_by + '_slider');
                                    const inherit_elem = document.getElementById(element.inherit_by);

                                    // input.setAttribute('price', inherit_elem.value * element.price);
                                    dictionary[element.id].price = inherit_elem.value * element.price

                                    inherit_slider.oninput = () => {

                                        if (dictionary[element.inherit_by].elem_type === 'named_slider') {
                                            inherit_elem.value = dictionary[element.inherit_by].named_slider_values[inherit_slider.value];
                                        } else {
                                            inherit_elem.value = inherit_slider.value;
                                        }

                                        dictionary[element.id].price = inherit_elem.value * element.price
                                        sumTicket();
                                    }
                                } else if (element.inherit_by !== null && element.inherit_by === '*') {
                                    input.setAttribute('inherit_by', '*');
                                }

                            } else if (element.type === 'list') {

                                const service_list_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" class="service_list_head_svg"><path d="M15.5917 6.84123C15.5142 6.76312 15.422 6.70112 15.3205 6.65882C15.2189 6.61651 15.11 6.59473 15 6.59473C14.89 6.59473 14.7811 6.61651 14.6795 6.65882C14.578 6.70112 14.4858 6.76312 14.4083 6.84123L10.5917 10.6579C10.5142 10.736 10.422 10.798 10.3205 10.8403C10.2189 10.8826 10.11 10.9044 10 10.9044C9.89 10.9044 9.78108 10.8826 9.67953 10.8403C9.57798 10.798 9.48581 10.736 9.40834 10.6579L5.59168 6.84123C5.51421 6.76312 5.42204 6.70112 5.32049 6.65882C5.21894 6.61651 5.11002 6.59473 5.00001 6.59473C4.89 6.59473 4.78108 6.61651 4.67953 6.65882C4.57798 6.70112 4.48581 6.76312 4.40834 6.84123C4.25313 6.99736 4.16602 7.20857 4.16602 7.42873C4.16602 7.64888 4.25313 7.86009 4.40834 8.01623L8.23334 11.8412C8.70209 12.3094 9.33751 12.5724 10 12.5724C10.6625 12.5724 11.2979 12.3094 11.7667 11.8412L15.5917 8.01623C15.7469 7.86009 15.834 7.64888 15.834 7.42873C15.834 7.20857 15.7469 6.99736 15.5917 6.84123Z"/></svg>';

                                const main_btn = document.createElement('button');
                                service_inputs.appendChild(main_btn);
                                main_btn.type = 'button';
                                main_btn.id = element.id;
                                main_btn.name = element.id;
                                main_btn.innerText = element.value_text[0].value;
                                main_btn.value = element.value_text[0].value;
                                main_btn.className = 'service_list_head_btn';
                                // main_btn.setAttribute('price', element.value_text[0].price)
                                main_btn.setAttribute('isOneGetService', element.isOneGetService)
                                main_btn.setAttribute('elem_type', 'list');
                                main_btn.innerHTML += service_list_svg;
                                
                                dictionary[element.id] = {
                                    price: element.price,
                                    isOneGetService: element.isOneGetService,
                                    elem_type: 'list'
                                }

                                const service_list_div = document.createElement('div');
                                service_inputs.appendChild(service_list_div);
                                service_list_div.className = 'service_list_div';
                                // service_list_div.style = 'display: none';
                                service_list_div.hidden = true;

                                element.value_text.map((ser_btn) => {
                                    const service_btn = document.createElement('button');
                                    service_btn.type = 'button';
                                    service_list_div.appendChild(service_btn);
                                    service_btn.className = 'service_list_btn_selector';
                                    service_btn.innerText = ser_btn.value;
                                    service_btn.onclick = () => {
                                        main_btn.value = ser_btn.value;
                                        // main_btn.setAttribute('price', ser_btn.price);
                                        dictionary[main_btn.id].price = ser_btn.price
                                        main_btn.innerHTML = ser_btn.value;
                                        main_btn.innerHTML += service_list_svg;
                                        // service_list_div.style = 'display: none';
                                        main_btn.click();
                                        sumTicket();
                                    }
                                })

                                main_btn.onclick = () => {
                                    if (service_list_div.hidden === true) {
                                        // service_list_div.style = 'display: block';
                                        service_list_div.hidden = false;
                                        return
                                    }
                                    // service_list_div.style = 'display: none';
                                    service_list_div.hidden = true;
                                }
                            } else if (element.type === 'named_slider') {

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
                                input.oninput = sumTicket();
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
                                
                                dictionary[element.id] = {
                                    price: element.price,
                                    isOneGetService: element.isOneGetService,
                                    elem_type: 'named_slider',
                                    named_slider_values: test_arr
                                }

                                range.oninput = () => {
                                    document.getElementById(element.id).value = test_arr[range.value];
                                    sumTicket();
                                }

                                // Изменяем oninput для наследуемого элемента, если таковой имеется
                                if (element.inherit_by !== null && element.inherit_by !== '*') {
                                    const inherit_slider = document.getElementById(element.inherit_by + '_slider');
                                    const inherit_elem = document.getElementById(element.inherit_by);
                                    inherit_slider.onchange = () => {
                                        inherit_elem.value = inherit_slider.value;
                                        dictionary[input.id].price = inherit_slider.value * element.price
                                        sumTicket();
                                    }
                                }
                            } else if (element.type === 'static') {

                                const input = document.createElement('input');
                                input.className = 'service_static';
                                input.type = 'text';
                                input.readOnly = true;
                                input.value = element.value;
                                input.id = element.id;

                                service_inputs.appendChild(input);
                                
                                dictionary[element.id] = {
                                    price: element.price,
                                    isOneGetService: element.isOneGetService,
                                    elem_type: 'static'
                                }

                            }
                        })

                        // block.innerHTML += '<div class="div_to_cart"><button class="btn_add_to_cart" onclick="add_to_cart("' + block.id + '")">В корзину</button></div>'

                        const temp_div = document.createElement('div');
                        block.appendChild(temp_div);
                        temp_div.className = 'div_to_cart';

                        const btn_add_to_cart = document.createElement('button');
                        temp_div.appendChild(btn_add_to_cart);
                        btn_add_to_cart.className = 'btn_add_to_cart';
                        btn_add_to_cart.setAttribute('onclick', 'add_to_cart("' + block.id + '")')
                        btn_add_to_cart.innerText = 'В корзину';
                        
                    })
                }        
            )
            counter++;
        })
    }

    
    // прячем все ненужные input'ы
    nav_elem.forEach(function(e) {
        e.className = 'nav_link';
        document.getElementById('block_' + e.getAttribute('block_id')).hidden = true;
    });

    elem.classList.add('nav_link_selected');
    document.getElementById('block_' + elem.getAttribute('block_id')).hidden = false;

    // Добавляем выбранную услугу как выбранную
    // if (usedServices.includes('block_' + elem.getAttribute('block_id')) === false) {
    //     usedServices.push('block_' + elem.getAttribute('block_id'));
    // }

    // Скрываем help_block
    document.getElementById('help_block').hidden = true;

    sumTicket();

}

function add_to_cart(id) { // Для добавления услуг в корзину
    if (usedServices.indexOf(id) != -1) {
        return
    }
    
    usedServices.push(id);
    sumTicket();
}

function sumTicket() { // Подсчет имеющихся услуг
    let itogoAllServices = 0

    const ticket_lines = document.getElementById('ticket_lines');
    ticket_lines.innerHTML = '';

    if (usedServices.length === 0) {
        document.getElementById('empty_ticket').hidden = false;
        document.getElementById('ticket').hidden = true;
        document.getElementById('helper').hidden = true;
    } else if (usedServices.length != 0) {
        document.getElementById('empty_ticket').hidden = true;
        document.getElementById('ticket').hidden = false;
        document.getElementById('helper').hidden = false;
    }

    usedServices.map( function(e) {
        let itogo = 0; // Суммарная стоимость 1 услуги
        let multiply = 0; // На сколько будет умножаться суммарная стоимость 1 услуги
        const inputs = document.querySelectorAll('#' + e + ' .service_slider_numbers');
        const checkboxs = document.querySelectorAll('#' + e + ' .service_checkbox_hidden');
        const lists = document.querySelectorAll('#' + e + ' .service_list_head_btn');
        const statics = document.querySelectorAll('#' + e + ' .service_static');

        inputs.forEach( function(e_input) {

            if (e_input.getAttribute('inherit_by') === '*') {
                multiply += e_input.value;
            } else {
                let e_price = dictionary[e_input.id].price;
                if (dictionary[e_input.id].isOneGetService === true) {
                    itogo += e_price * e_input.value;
                } else {
                    itogo += e_price * e_input.value / 6;
                }
            }
            
        })

        checkboxs.forEach( function(e_check) {
            if (e_check.checked === true) {
                let e_price = dictionary[e_check.id].price;
                if (dictionary[e_check.id].isOneGetService === true) {
                    itogo += e_price * 1;
                } else {
                    itogo += e_price * 1 / 6;
                }
            }
        })

        lists.forEach( function(e_list) {
            let e_price = dictionary[e_list.id].price;
            if (dictionary[e_list.id].isOneGetService === true) {
                itogo += e_price * 1;
            } else {
                itogo += e_price * 1 / 6;
            }
        })

        //service_static
        statics.forEach( function(e_static) {
            console.log(e_static.id)
            let e_price = dictionary[e_static.id].price;
            if (dictionary[e_static.id].isOneGetService === true) {
                itogo += e_price * 1;
            } else {
                itogo += e_price * 1 / 6;
            }
        })

        if (multiply !== 0) {
            itogo = itogo * multiply;
        }

        itogoAllServices += itogo;

        // отображаем чек
        const ticket_line = document.createElement('div')
        ticket_lines.appendChild(ticket_line);
        ticket_line.className = 'ticket_line';

        const ticket_line_desc = document.createElement('p')
        ticket_line.appendChild(ticket_line_desc);
        ticket_line_desc.className = 'ticket_line_desc';
        ticket_line_desc.innerText = document.getElementById(e).getAttribute('name');

        const ticket_summary = document.createElement('div');
        ticket_line.appendChild(ticket_summary);
        ticket_summary.className = 'ticket_summary';

        const ticket_line_sum = document.createElement('p');
        ticket_summary.appendChild(ticket_line_sum);
        ticket_line_sum.className = 'ticket_line_sum';
        ticket_line_sum.innerHTML = (itogo).toFixed(2) + ' &#8381;/мес';

        const ticket_summary_btn = document.createElement('button');
        ticket_summary.appendChild(ticket_summary_btn);
        ticket_summary_btn.className = 'ticket_btn_del';
        ticket_summary_btn.setAttribute('name', e);
        ticket_summary_btn.onclick = () => {
            new_arr = [];
            usedServices.forEach( (e) => {
                if ( !(e === ticket_summary_btn.getAttribute('name')) ) {
                    new_arr.push(e);
                }
            })

            usedServices = new_arr;
            sumTicket();
        }
        ticket_summary_btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" class="delete_ticket_line"><path d="M11.7674 10.0003L14.9999 6.76442C15.2098 6.52589 15.321 6.21639 15.3108 5.89883C15.3007 5.58128 15.17 5.2795 14.9454 5.05484C14.7207 4.83018 14.4189 4.6995 14.1014 4.68936C13.7838 4.67922 13.4743 4.79039 13.2358 5.00026L9.99994 8.23276L6.75828 4.99026C6.64216 4.87415 6.50432 4.78204 6.35262 4.7192C6.20091 4.65637 6.03831 4.62402 5.87411 4.62402C5.7099 4.62402 5.54731 4.65637 5.3956 4.7192C5.2439 4.78204 5.10605 4.87415 4.98994 4.99026C4.87383 5.10637 4.78173 5.24421 4.71889 5.39592C4.65605 5.54762 4.62371 5.71022 4.62371 5.87442C4.62371 6.03863 4.65605 6.20123 4.71889 6.35293C4.78173 6.50464 4.87383 6.64248 4.98994 6.75859L8.23244 10.0003L4.99994 13.2353C4.87317 13.3486 4.77085 13.4866 4.69924 13.6408C4.62764 13.795 4.58825 13.9622 4.5835 14.1322C4.57874 14.3022 4.60871 14.4714 4.67158 14.6293C4.73445 14.7873 4.82889 14.9308 4.94912 15.0511C5.06936 15.1713 5.21286 15.2658 5.37086 15.3286C5.52885 15.3915 5.698 15.4215 5.86798 15.4167C6.03795 15.4119 6.20517 15.3726 6.35939 15.301C6.51362 15.2293 6.65162 15.127 6.76494 15.0003L9.99994 11.7678L13.2316 15.0003C13.4661 15.2348 13.7841 15.3665 14.1158 15.3665C14.4474 15.3665 14.7654 15.2348 14.9999 15.0003C15.2344 14.7658 15.3662 14.4477 15.3662 14.1161C15.3662 13.7845 15.2344 13.4664 14.9999 13.2319L11.7674 10.0003Z"/></svg>'
    })

    document.getElementById('ticket_sum').innerHTML = (itogoAllServices).toFixed(2) + ' &#8381;/мес';
}

function changeCheckBoxValue(e, hidden_e) {
    // Смена значения у чекбокса

    if (hidden_e.checked) {
        e.className = 'service_checkbox_checked';
    } else {
        e.className = 'service_checkbox';
    }
}