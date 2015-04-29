export default {
  name: 'add-pop-over-container',
  initialize: function(container, application){
    const rootEl               = document.querySelector(application.rootElement);
    const popOverContainerEl   = document.createElement('div');
    const emberPopOver         = application.emberPopOver || {};
    const popOverContainerElId = emberPopOver.popOverRootElementId || 'pop-overs';

    popOverContainerEl.id = popOverContainerElId;
    rootEl.appendChild(popOverContainerEl);

    application.register('config:pop-over-container-id',
                         popOverContainerElId,
                         { instantiate: false });

    application.inject('service:pop-over',
                       'destinationElementId',
                       'config:pop-over-container-id');
  }
};
