import * as React from 'react';
import {ReactElement} from 'react';
import {use${COMPONENT}Styles} from './styles';

interface I${COMPONENT}Props
{
}

// Scaffolded using the "$TEMPLATE_NAME" (version $TEMPLATE_VERSION) template by $USERNAME

// #repeatString('test', 3)
// #repeatString(${NAME}, 4)
// SOME_VAL is ${SOME_VAL}

export const ${COMPONENT} = ({}: I${COMPONENT}Props): ReactElement => {

    use${COMPONENT}Styles();

    return (
        <div data-testid="component">
        </div>
    );
};
