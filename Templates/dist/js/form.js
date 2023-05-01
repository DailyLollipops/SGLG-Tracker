class Form{
    constructor(containerID){
        this.containerID = containerID;
        this.element = document.getElementById(containerID);
        this.element.classList.add('flex','flex-col','space-y-4');
        this.element.setAttribute('data-nodes', '0');
        this.nodes = {};
    }

    get(){
        return this.element;
    }

    getWrapper(){
        return this.element;
    }

    getID(){
        return this.containerID;
    }

    addMainNode(nodeId, question='', hasAttachment = false, type = 'text', options = []){
        var node = new FormNode(nodeId, question='', hasAttachment = false, type = 'text', options = []);
        node.addTo(this);
        this.nodes[nodeId] = node;
    }

    addSubNode(nodeId, question='', hasAttachment = false, type = 'text', options = []){
        var parentNodeId = nodeId.slice(0, nodeId.lastIndexOf('-'));
        console.log(parentNodeId);
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

}

class FormNode {
    /**
     * Create a MainNode Component
     * 
     * Wrapped on the main container
     * 
     * Serves as a main indicator for each governance area
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

        // Create a div element
        this.element = document.createElement('div');

        // Set element's classes
        this.element.classList.add('wrapper','flex','flex-col','space-y-4');

        // Create the main component
        this.element.innerHTML = '<div id="' + id +  '" class="node flex flex-row space-x-4 items-center md:justify-center" data-options="' + options.length + '" data-nodes="0" data-level="1">' +
                    '<div id="' + id + '-form' + '" class="form flex flex-col p-3 border-2 border-slate-300 rounded-lg drop-shadow-md space-y-4 w-5/6 md:w-1/2">' +
                        '<div class="flex flex-col p-2">' +
                            '<span role="textbox" id="' + id + '-indicator" class="indicator textarea grow-0 border-solid border-b-2 border-zinc-400 px-2 py-1" contenteditable></span>' + 
                        '</div>' +
                        '<div class="flex flex-row space-x-4">' +
                            '<div class="flex flex-row basis-1/2 p-2">' +
                                '<input type="checkbox" id="' + id + '-has_attachment" name="' + id + '-has_attachment" class="attachment border-solid border-2 rounded-full border-zinc-400 p-2">' +
                                '<label for="' + id + '-has_attachment" class="my-auto m-2">Has attachments</label>' +
                            '</div>' +
                            '<select name="' + id + '-type" id="' + id + '-type" class="type w-2/5 border-solid border-2 rounded-lg border-zinc-400 py-2">' +
                                '<option value="text" class="text-base">Text</option>' +
                                '<option value="date" class="text-base">Date</option>' +
                                '<option value="list" class="text-base">List</option>' +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                    '<div class="node-menu flex flex-col space-y-4 items-center w-1/6 md:w-1/12">' +
                        '<div class="w-8 overflow-hidden inline-block">' +
                            '<img src="../images/close.png" alt="" class="delete-node w-4 h-4 my-auto ml-1 cursor-pointer">' +
                        '</div>' +
                        '<div class="w-8 overflow-hidden inline-block">' +
                            '<div class=" h-4 w-4 bg-black rotate-45 transform origin-bottom-left"></div>' +
                        '</div>' +
                        '<div class="w-8 overflow-hidden inline-block">' +
                            '<div class=" h-4 w-4 bg-black -rotate-45 transform origin-top-left"></div>' +
                        '</div>' +
                        '<div class="w-8 overflow-hidden inline-block">' +
                            '<img src="../images/plus.png" alt="" class="add-node w-4 h-4 my-auto ml-1 cursor-pointer" onclick="addSubnode(\'' +id+ '\')">' +
                        '</div>' +
                    '</div>' +
                '</div>';

        this.wrapper = this.element.querySelector('.wrapper');
        this.node = this.element.querySelector('.node');
        this.form = this.element.querySelector('.form');
        this.questionField = this.element.querySelector('.indicator');
        this.hasAttachmentField = this.element.querySelector('.attachment');
        this.typeSelectorField = this.element.querySelector('.type');
        this.deleteButton = this.element.querySelector('.delete-node');
        this.addButton = this.element.querySelector('.add-node');

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

    getWrapper(){
        return this.wrapper;
    }

    getNode(){
        return this.node;
    }

    getID(){
        return this.id;
    }

    getSubnodes(){
        var subnodes = parseInt(this.node.getAttribute('data-nodes'));
        return subnodes;
    }

    addTo(parentNode, root = true, level = 1){
        this.container = parentNode;
        if(root){
            var currentContainerNode = parseInt(this.container.get().getAttribute('data-nodes'));
            if(currentContainerNode == 0){
                var list = document.createElement('ul');
                list.classList.add('space-y-4');
                list.setAttribute('id', this.container.getID()+'-subnodes');
                var item = document.createElement('li');
                item.appendChild(this.get());
                list.appendChild(item);
                this.container.get().appendChild(list);
                this.container.get().setAttribute('data-nodes', '1');
            }
            else{
                var list = this.container.get().querySelector('#' +this.container.getID()+'-subnodes');
                var item = document.createElement('li');
                item.appendChild(this.get());
                list.appendChild(item);
                this.container.get().setAttribute('data-nodes', parseInt(currentContainerNode+1));
            }
        }
        else{
            this.attachedToRoot = false;
            this.get().classList.add('ml-'+level*12)
            this.get().setAttribute('level', level);
            var currentContainerNode = parseInt(this.container.getNode().getAttribute('data-nodes'));
            if(currentContainerNode == 0){
                var list = document.createElement('ul');
                list.classList.add('space-y-4');
                list.setAttribute('id', this.container.getID()+'-subnodes');
                var item = document.createElement('li');
                item.appendChild(this.get());
                list.appendChild(item);
                this.container.get().appendChild(list);
                this.container.getNode().setAttribute('data-nodes', '1');
            }
            else{
                var list = this.container.get().querySelector('#' +this.container.getID()+'-subnodes');
                var item = document.createElement('li');
                item.appendChild(this.get());
                list.appendChild(item);
                this.container.getWrapper().setAttribute('data-nodes', parseInt(currentContainerNode+1));
            }
        }

        this.typeSelectorField.addEventListener('change', this.changeNode.bind(this));
        this.deleteButton.addEventListener('click', this.remove.bind(this));
    }

    remove(){
        if(this.attachedToRoot){
            var currentContainerNode = parseInt(this.container.get().getAttribute('data-nodes'));
        }
        else{
            var currentContainerNode = parseInt(this.container.getNode().getAttribute('data-nodes'));
        }
        var list = this.container.get().querySelector('#' +this.container.getID()+'-subnodes');
        if(currentContainerNode == 1){
            this.container.get().removeChild(list);
        }
        else{
            list.removeChild(this.element.parentNode);
        }
        this.container.get().setAttribute('data-nodes', parseInt(currentContainerNode-1));
        
    }

    changeNode(){
        if(this.typeSelectorField.value == 'list'){
            var optionContainer = document.createElement('div');
            optionContainer.setAttribute('id', this.id+'-options');
            var option1 = new Option(this.id);
            var option2 = new Option(this.id);
            optionContainer.appendChild(option1);
            optionContainer.appendChild(option2);
            this.form.appendChild(optionContainer);
        }
        else{
            optionContainer = this.element.querySelector(this.id+'-options');
            if(optionContainer){
                wrapper.removeChild(optionContainer);
                this.element.setAttribute('data-options', '0')
            }
        }
    }
}

class Option{
    /**
     * Create an option component
     * 
     * Wrapped on the node's wrapper
     * 
     * @param {String} nodeID The parent's node ID
     * @param {*} option Option field - blank by default
     * @param {*} load Set to `true` if used to load existing form
     * @param {*} index Required if load is set to `true`
     */
    constructor(nodeID, option = '', load = false, index = 0) {

        // Get parent node element
        var node = document.getElementById(nodeID);

        // Initialize component for each cases
        // Option 1: No delete and add button
        // Option 2: No delete button but has add button
        // Option 3: Has delete and add button
        var block = '';
        var option1 = `<img src="../images/radio.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${nodeID}-option" id="${nodeID}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 md:ml-2 md:basis-3/4" placeholder="Option">`;
        var option2 = `<img src="../images/radio.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${nodeID}-option" id="${nodeID}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 md:ml-2 md:basis-3/4" placeholder="Option"><img src="../images/plus.png" alt="" class="h-4 my-auto cursor-pointer" onclick="addOption(\'${nodeID}\')">`;
        var option3 = `<img src="../images/radio.png" alt="" class="h-4 ml-4 my-auto"><input type="text" name="${nodeID}-option" id="${nodeID}-option" value="${option}" class="option basis-2/3 border-solid border-b-2 border-zince-400 py-2 md:ml-2 md:basis-3/4" placeholder="Option"><img src="../images/plus.png" alt="" class="h-4 my-auto cursor-pointer" onclick="addOption(\'${nodeID}\')"><img src="../images/close.png" alt="" class="h-4 my-auto cursor-pointer" onclick="deleteOption(this)">`;
        
        // If loading is set to true
        // doesn't make use of current options of parent node
        // Set component based on the provided index
        if(load){
            if(index == 0){
                block =  option1;
            }
            else if(index == 1){
                block = option2;
            }
            else{
                block =  option3;
            }    
        }

        // Otherwise, get current options of parent node
        // then set component based on current options
        else{
            var nodeOptions = parseInt(node.getAttribute('data-options'));
            if(nodeOptions == 0){
                block =  option1;
            }
            else if(nodeOptions == 1){
                block = option2;
            }
            else{
                block =  option3;
            }
            node.setAttribute('data-options', parseInt(nodeOptions+1));
        }

        // Create wrapper element
        this.element = document.createElement('div');
        this.element.classList.add('flex','flex-row','space-x-4','items-center')
        this.element.innerHTML = block;

        return this.element;
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