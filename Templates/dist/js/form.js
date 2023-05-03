class Form{
    constructor(containerId){
        this.containerId = containerId;
        this.element = document.getElementById(containerId);
        this.element.classList.add('flex','flex-col','space-y-4');
        this.element.setAttribute('data-nodes', '0');
        this.element.setAttribute('data-level', '0');
        var list = document.createElement('ul');
        list.classList.add('hidden','space-y-4');
        list.setAttribute('id', this.containerId+'-subnodes');
        this.element.appendChild(list);
        this.nodes = {};
    }
 
    get(){
        return this.element;
    }
 
    getNode(){
        return this.element;
    }

    getId(){
        return this.containerId;
    }
 
    getLevel(){
        return 0;
    }

    getSubnodes(){
        var subnodes = parseInt(this.element.getAttribute('data-nodes'));
        return subnodes;
    }

    getSubnodesContainer(){
        var container = this.element.querySelector('#' +this.containerId+'-subnodes');
        return container;
    }

    addMainNode(nodeId = '', question='', hasAttachment = false, type = 'text', options = []){
        if(nodeId.length == 0){
            nodeId = stringGen(8);
        }
        var node = new FormNode(nodeId, question, hasAttachment, type, options);
        node.addTo(this);
        this.nodes[nodeId] = node;
    }
 
    addSubNode(parentNodeId, nodeId = '', question = '', hasAttachment = false, type = 'text', options = []){
        if(parentNodeId in this.nodes){
            var parentNode = this.nodes[parentNodeId]
            var node = new FormNode(nodeId, question, hasAttachment, type, options);
            node.addTo(parentNode);
            this.nodes[nodeId] = node;
        }
    }
 
    removeNode(nodeId){
        if(nodeId in this.nodes){
            var node = this.nodes[nodeId];
            node.remove();
            delete this.nodes[nodeId];
        }
    }

    load(json){
        for(let node in json){
            var question = json[node]['question'];
            var hasAttachment = json[node]['has_attachment'];
            var type = json[node]['type'];
            var options = json[node]['options'];
            if(json[node]['parent'] != this.containerId){
                var parentNodeID = json[node]["parent"];
                this.addSubNode(parentNodeID, node, question, hasAttachment, type, options);
            }
            else{
               this.addMainNode(node, question, hasAttachment, type, options);
            }
        }
    }

    save(){
        var json = {};
        var nodes = this.element.querySelectorAll('.node');
        var validated = true;
        var nodeIdWithError = '';
        for(let i = 0; i < nodes.length; i++){
            var node = nodes[i];
            var options = []
            var id = node.getAttribute('id');
            var parent = node.getAttribute('data-parent');
            var question = node.querySelector('.indicator').innerHTML;
            var hasAttachment = node.querySelector('.attachment').checked;
            var type = node.querySelector('.type').value;
            var nodeOptions = parseInt(node.getAttribute('data-options'));
            if(nodeOptions > 0){
                var optionFields = node.querySelectorAll('.option')
                optionFields.forEach(function(optionField){
                    if(optionField.value.length > 0){
                        options.push(optionField.value);
                    }
                });
            }
            if(question.length == 0 || (nodeOptions > 0 && options.length <= 1)){
                validated = false;
                nodeIdWithError = id;
                break;
            }
            json[id] = {
                "parent": parent,
                "question": question,
                "has_attachment": hasAttachment,
                "type": type,
                "options": options
            }
        }
        if(validated){
            return json;
        }
        else{
            alert('Please complete or delete blank fields');
            var errorNode = this.element.querySelector('#' + nodeIdWithError);
            errorNode.children[0].classList.remove('border-slate-300');
            errorNode.children[0].classList.add('border-red-500');
        }
    }
}
 
class FormNode {
    /**
     * Create FormNode Component
     * 
     * @param {String} id Component ID 
     * @param {String} question Node question, empty by default
     * @param {boolean} hasAttachment Accepts attachment if `true`, otherwise false
     * @param {String} type Node type - Possible values `('text','date','list')`
     * @param {list} options Options list - Only add if type is set to `'list'`
     */
    constructor(id, question='', hasAttachment = false, type = 'text', options = []) {
 
        // Set component id
        this.id = id;
 
        // Set parent container to null
        this.container = null;
 
        this.attachedToRoot = true;
 
        this.level = 1;

        // Create a div element
        this.element = document.createElement('div');
 
        // Set element's classes
        this.element.classList.add('wrapper','flex','flex-col','space-y-4');
 
        // Create the main component
        this.element.innerHTML = '<div id="' + id +  '" class="node flex flex-row space-x-4 items-center md:justify-center" data-options="' + options.length + '" data-nodes="0" data-level="1" data-parent="">' +
                    '<div id="' + id + '-form' + '" class="form flex flex-col p-3 border-2 border-slate-300 rounded-lg drop-shadow-md space-y-4 w-5/6 md:w-1/2 hover:border-l-8 hover:border-l-indigo-500">' +
                        '<div class="flex flex-col p-2">' +
                            '<span role="textbox" id="' + id + '-indicator" class="indicator textarea text-sm grow-0 border-solid border-b-2 border-zinc-400 px-2 py-1" contenteditable></span>' + 
                        '</div>' +
                        '<div class="flex flex-row space-x-4">' +
                            '<div class="flex flex-row items-center basis-1/2 p-2">' +
                                '<input type="checkbox" id="' + id + '-has_attachment" name="' + id + '-has_attachment" value="" class="attachment w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">' +
                                '<label for="' + id + '-has_attachment" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Has Attachment</label>' +
                            '</div>' +
                            '<div class="relative h-10 w-72 min-w-[200px]">' +
                            '<select name="' + id + '-type" id="' + id + '-type" class="type peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 empty:!bg-red-500 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50">' +
                                '<option value="placeholder" class="text-base">Title</option>' +
                                '<option value="text" class="text-base">Short Answer</option>' +
                                '<option value="date" class="text-base">Date</option>' +
                                '<option value="multiple_choice" class="text-base">Multiple Choices</option>' +
                                '<option value="checkbox" class="text-base">Checkboxes</option>' +
                            '</select>' +
                            '<label class="before:content[\' \'] after:content[\' \'] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-pink-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-pink-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-pink-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">' +
                                'Choose Answer Type' +
                            '</label>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="node-menu flex flex-col items-center">' +
                        '<button class="delete-node hidden font-bold py-1 inline-flex items-center">' +
                            '<img src="../images/bin.png">' +
                        '</button>' +
                        '<button class="move-up hidden font-bold py-1 inline-flex items-center">' +
                            '<img src="../images/up-arrow.png">' +
                        '</button>' +
                        '<button class="move-down hidden font-bold py-1 inline-flex items-center">' +
                            '<img src="../images/down-arrow.png">' +
                        '</button>' +
                        '<button class="add-node hidden font-bold py-1 inline-flex items-center">' +
                            '<img src="../images/add.png">' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<ul id="'+ this.id +'-subnodes" class="hidden space-y-4"></ul>';
 
        this.node = this.element.querySelector('.node');
        this.form = this.element.querySelector('.form');
        this.questionField = this.element.querySelector('.indicator');
        this.hasAttachmentField = this.element.querySelector('.attachment');
        this.typeSelectorField = this.element.querySelector('.type');
        this.deleteButton = this.element.querySelector('.delete-node');
        this.addButton = this.element.querySelector('.add-node');
        this.moveUpButton = this.element.querySelector('.move-up');
        this.moveDownButton = this.element.querySelector('.move-down');
        this.menu = this.element.querySelector('.node-menu');

        this.questionField.innerText = question;
        this.hasAttachmentField.checked = hasAttachment;
        this.typeSelectorField.value = type;
        if(options.length > 0){
            for(let i = 0; i < options.length; i++){
                this.addOption(this, options[i]);
            }
        }
    }
 
    get(){
        return this.element;
    }
 
    getNode(){
        return this.node;
    }
 
    getId(){
        return this.id;
    }
 
    getSubnodes(){
        var subnodes = parseInt(this.node.getAttribute('data-nodes'));
        return subnodes;
    }

    getSubnodesContainer(){
        var container = this.element.querySelector('#' +this.id+'-subnodes');
        return container;
    }

    getLevel(){
        this.level = parseInt(this.node.getAttribute('data-level'));
        return this.level;
    }

    getData(){
        var optionFields = this.form.querySelectorAll('.option');
        var options = [];
        for(let i = 0; i < optionFields.length; i++){
            options.push(optionFields[i].value);
        }
        var data = {};
        data['parent'] = this.container.getId();
        data['question'] = this.questionField.innerHTML;
        data['has_attachment'] = this.hasAttachmentField.checked;
        data['type'] = this.typeSelectorField.value;
        data['options'] = options;
        return data;
    }

    addTo(parentNode){
        this.container = parentNode;
        var containerLevel = this.container.getLevel();
        this.node.setAttribute('data-level', containerLevel+1);
        this.node.setAttribute('data-parent', this.container.getId());
        this.get().classList.add('ml-'+ this.level*12);
        var containerList = this.container.getSubnodesContainer();
        var item = document.createElement('li');
        item.appendChild(this.get());
        containerList.appendChild(item);
        var currentContainerNode = this.container.getSubnodes();
        this.container.getNode().setAttribute('data-nodes', parseInt(currentContainerNode+1));
        if(parseInt(currentContainerNode+1) >= 1){
            containerList.classList.remove('hidden');
        }
        this.typeSelectorField.addEventListener('change', this.changeNode.bind(this));
        this.deleteButton.addEventListener('click', this.remove.bind(this));
        this.addButton.addEventListener('click', this.addSubNode.bind(this));
        this.moveUpButton.addEventListener('click', this.moveUp.bind(this));
        this.moveDownButton.addEventListener('click', this.moveDown.bind(this));
        this.node.addEventListener('mouseenter', this.showMenu.bind(this));
        this.node.addEventListener('mouseleave', this.hideMenu.bind(this));
    }
 
    remove(){
        var currentContainerNode = this.container.getSubnodes();
        var list = this.container.getSubnodesContainer();
        list.removeChild(this.element.parentNode);
        this.container.get().setAttribute('data-nodes', parseInt(currentContainerNode-1));
        if(parseInt(currentContainerNode-1) == 0){
            list.classList.add('hidden');
        }
    }
 
    changeNode(e){
        var optionContainer = this.element.querySelector('.options');
        if(optionContainer){
            this.form.removeChild(optionContainer);
            this.node.setAttribute('data-options', '0')
        }
        var value = this.typeSelectorField.value
        if(value == 'multiple_choice' || value == 'checkbox'){
            this.addOption(e);
            this.addOption(e);
        }
    }
 
    addSubNode(e){
        var id = stringGen(8)
        var node = new FormNode(id);
        node.addTo(this);
    }

    addOption(e, option = ''){
        var nodeType = this.typeSelectorField.value;
        if(nodeType == 'checkbox' || nodeType == 'multiple_choice'){
            var optionId =  stringGen(8);
            var nodeOptions = parseInt(this.node.getAttribute('data-options'));
            var image = ''
            if(nodeType == 'checkbox'){
                image = 'checkbox';
            }
            else{
                image = 'radio';
            }
            var option1 = `<img src="../images/${image}.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${this.id}-option" id="${this.id}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 pl-2 text-sm md:ml-2 md:basis-3/4" placeholder="Option">`;
            var option2 = `<img src="../images/${image}.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${this.id}-option" id="${this.id}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 pl-2 text-sm md:ml-2 md:basis-3/4" placeholder="Option"><img src="../images/plus.png" alt="" class="add-option h-4 my-auto cursor-pointer">`;
            var option3 = `<img src="../images/${image}.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${this.id}-option" id="${this.id}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 pl-2 text-sm md:ml-2 md:basis-3/4" placeholder="Option"><img src="../images/plus.png" alt="" class="add-option h-4 my-auto cursor-pointer"><img src="../images/close.png" alt="" class="delete-option h-4 my-auto cursor-pointer">`;
            var option = document.createElement('div');
            option.classList.add('flex','flex-row','space-x-4','items-center');
            option.setAttribute('id', optionId);
            if(nodeOptions == 0){
                option.innerHTML = option1;
            }
            else if(nodeOptions == 1){
                option.innerHTML = option2;
                var addButton = option.querySelector('.add-option');
                addButton.addEventListener('click', this.addOption.bind(this));
            }
            else{
                option.innerHTML = option3;
                var addButton = option.querySelector('.add-option');
                var deleteButton = option.querySelector('.delete-option');
                addButton.addEventListener('click', this.addOption.bind(this));
                deleteButton.addEventListener('click', this.removeOption.bind(this, e, optionId));
            }
            var optionContainer = this.node.querySelector('.options');
            if(!optionContainer){
                optionContainer = document.createElement('div');
                optionContainer.setAttribute('id', this.id+'-options');
                optionContainer.classList.add('options');
                this.form.appendChild(optionContainer);
            }
            optionContainer.appendChild(option);
            this.node.setAttribute('data-options', parseInt(nodeOptions+1));
        }
        else{
            alert('Current node type does not support options');
        }
    }
 
    removeOption(e, optionId){
        var optionContainer = this.node.querySelector('.options');
        var option = optionContainer.querySelector('#'+optionId);
        optionContainer.removeChild(option);
        var nodeOptions = this.node.getAttribute('data-options');
        this.node.setAttribute('data-options', parseInt(nodeOptions-1));
    }

    moveUp(e){
        var item = this.element.parentNode;
        if(item.previousElementSibling){
            this.container.getSubnodesContainer().insertBefore(item, item.previousElementSibling);
        }
    }

    moveDown(e){
        var item = this.element.parentNode;
        if(item.nextElementSibling){
            this.container.getSubnodesContainer().insertBefore(item.nextElementSibling, item );
        }
    }

    hideMenu(e){
        this.addButton.classList.add('hidden');
        this.deleteButton.classList.add('hidden');
        this.moveUpButton.classList.add('hidden');
        this.moveDownButton.classList.add('hidden');
    }

    showMenu(e){
        this.form.classList.remove('border-red-500');
        this.form.classList.add('border-slate-300');
        this.addButton.classList.remove('hidden');
        this.deleteButton.classList.remove('hidden');
        this.moveUpButton.classList.remove('hidden');
        this.moveDownButton.classList.remove('hidden');
    }
}

function stringGen(len)
{
    var text = '';
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
 
    text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    for( var i=1; i < len; i++ ){
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }
 
    return text;
}
