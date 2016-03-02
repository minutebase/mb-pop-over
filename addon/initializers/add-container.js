export default function() {
  if (typeof FastBoot) {
    return;
  }

  const application = arguments[1] || arguments[0];

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