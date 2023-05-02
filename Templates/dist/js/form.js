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

    addMainNode(nodeId = '', question='', hasAttachment = false, type = 'text', options = []){
        if(nodeId.length == 0){
            nodeId = stringGen(8);
        }
        var node = new FormNode(nodeId, question='', hasAttachment = false, type = 'text', options = []);
        node.addTo(this);
        this.nodes[nodeId] = node;
    }
 
    addSubNode(nodeId, question='', hasAttachment = false, type = 'text', options = []){
        var parentNodeId = nodeId.slice(0, nodeId.lastIndexOf('-'));
        var level = parentNodeId.split('-').length;
        if(parentNodeId in this.nodes){
            var parentNode = this.nodes[parentNodeId];
            var parentSubnodes = parentNode.getSubnodes();
            var nodeId = parentNodeId + '-' + parseInt(parentSubnodes+1);
            var node = new FormNode(nodeId, question='', hasAttachment = false, type = 'text', options = []);
            node.addTo(parentNode, false, level);
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

    getSubnodesContainer(){
        var container = this.element.querySelector('#' +this.containerId+'-subnodes');
        return container;
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
        this.element.innerHTML = '<div id="' + id +  '" class="node flex flex-row space-x-4 items-center md:justify-center" data-options="' + options.length + '" data-nodes="0" data-level="1">' +
                    '<div id="' + id + '-form' + '" class="form flex flex-col p-3 border-2 border-slate-300 rounded-lg drop-shadow-md space-y-4 w-5/6 md:w-1/2 hover:border-l-8 hover:border-l-indigo-500">' +
                        '<div class="flex flex-col p-2">' +
                            '<span role="textbox" id="' + id + '-indicator" class="indicator textarea grow-0 border-solid border-b-2 border-zinc-400 px-2 py-1" contenteditable></span>' + 
                        '</div>' +
                        '<div class="flex flex-row space-x-4">' +
                            '<div class="flex flex-row basis-1/2 p-2">' +
                                '<input type="checkbox" id="' + id + '-has_attachment" name="' + id + '-has_attachment" class="attachment border-solid border-2 rounded-full border-zinc-400 p-2">' +
                                '<label for="' + id + '-has_attachment" class="my-auto m-2 hover:text-sky-300">Has attachments</label>' +
                            '</div>' +
                            '<select name="' + id + '-type" id="' + id + '-type" class="type w-2/5 border-solid border-2 rounded-lg border-zinc-400 py-2">' +
                                '<option value="placeholder" class="text-base">Title</option>' +
                                '<option value="text" class="text-base">Short Answer</option>' +
                                '<option value="date" class="text-base">Date</option>' +
                                '<option value="multiple_choice" class="text-base">Multiple Choices</option>' +
                                '<option value="checkbox" class="text-base">Checkboxes</option>' +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                    '<div class="node-menu flex flex-col space-y-4 items-center w-1/6 md:w-1/12">' +
                        '<div class="w-8 overflow-hidden inline-block">' +
                            '<img src="../images/close.png" alt="" class="delete-node w-4 h-4 my-auto ml-1 cursor-pointer">' +
                        '</div>' +
                        '<div class="w-8 overflow-hidden inline-block">' +
                            '<div class="move-up h-4 w-4 bg-black rotate-45 transform origin-bottom-left cursor-pointer"></div>' +
                        '</div>' +
                        '<div class="w-8 overflow-hidden inline-block">' +
                            '<div class="move-down h-4 w-4 bg-black -rotate-45 transform origin-top-left cursor-pointer"></div>' +
                        '</div>' +
                        '<div class="w-8 overflow-hidden inline-block">' +
                            '<img src="../images/plus.png" alt="" class="add-node w-4 h-4 my-auto ml-1 cursor-pointer">' +
                        '</div>' +
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

        this.questionField.innerText = question;
        this.hasAttachmentField.checked = hasAttachment;
        this.typeSelectorField.value = type;
        if(options.length > 0){
            this.optionContainer = document.createElement('div');
            this.optionContainer.setAttribute('id', id+'-options');
            for(let i = 0; i < options.length; i++){
                var option = new Option(id, option = options[i], true, i);
                this.optionContainer.appendChild(option);
            }
            this.node.appendChild(this.optionContainer);
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
            var option1 = `<img src="../images/${image}.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${this.id}-option" id="${this.id}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 md:ml-2 md:basis-3/4" placeholder="Option">`;
            var option2 = `<img src="../images/${image}.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${this.id}-option" id="${this.id}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 md:ml-2 md:basis-3/4" placeholder="Option"><img src="../images/plus.png" alt="" class="add-option h-4 my-auto cursor-pointer">`;
            var option3 = `<img src="../images/${image}.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${this.id}-option" id="${this.id}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 md:ml-2 md:basis-3/4" placeholder="Option"><img src="../images/plus.png" alt="" class="add-option h-4 my-auto cursor-pointer"><img src="../images/close.png" alt="" class="delete-option h-4 my-auto cursor-pointer">`;
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
}
 
function loadCurrentForm(json){
    jsonObj = JSON.parse(json);
    for(let node in jsonObj){
        var question = jsonObj[node]["question"];
        var hasAttachment = jsonObj[node]["has_attachment"];
        var type = jsonObj[node]["type"];
        var options = jsonObj[node]["options"];
        if("parent" in jsonObj[node]){
            parentNodeID = jsonObj[node]["parent"];
            addSubnode(parentNodeID, node, question, hasAttachment, type, options);
        }
        else{
            addMainNode(node, question, hasAttachment, type, options);
        }
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
