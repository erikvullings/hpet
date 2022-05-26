import m from 'mithril';
import { Autocomplete, Collapsible, FlatButton } from 'mithril-materialized';
import { LayoutForm, UIForm } from 'mithril-ui-form';
import { Dashboards, defaultModel, User } from '../models';
import { MeiosisComponent } from '../services';

const userForm = [
  { id: 'id', type: 'none', autogenerate: 'id' },
  {
    id: 'name',
    label: 'Name',
    icon: 'title',
    type: 'text',
    required: true,
    className: 'col s3',
  },
  {
    id: 'email',
    label: 'Email',
    icon: 'email',
    type: 'email',
    required: true,
    className: 'col s4',
  },
  {
    id: 'phone',
    label: 'Phone',
    icon: 'phone',
    type: 'text',
    required: true,
    className: 'col s3',
  },
  {
    id: 'isAuthor',
    label: 'Author',
    icon: 'edit_note',
    type: 'checkbox',
    required: false,
    className: 'col s2',
  },
  {
    id: 'url',
    label: 'Image link',
    icon: 'link',
    type: 'url',
    required: false,
    className: 'col s12',
  },
] as UIForm;

export const SettingsPage: MeiosisComponent = () => {
  let newUser = {} as User;
  let addUser = false;
  let canSaveUser = false;

  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => setPage(Dashboards.SETTINGS),
    view: ({
      attrs: {
        state: { model = defaultModel },
        actions: { saveModel },
      },
    }) => {
      const { users = [], curUser } = model;
      return [
        m('.row.settings', [
          m(Autocomplete, {
            label: 'Current user',
            initialValue: curUser,
            data: users.reduce((acc, cur) => {
              acc[cur.name] = cur.url || null;
              return acc;
            }, {} as Record<string, string | null>),
            onchange: (v) => {
              model.curUser = v;
              saveModel(model);
            },
          }),
          m('.row.users', [
            m('h4', 'Users'),
            m(Collapsible, {
              items: users.map((user) => ({
                key: user.id,
                header: user.name || 'Empty',
                body: m('.row', [
                  m(LayoutForm, {
                    form: userForm,
                    obj: user,
                    onchange: () => saveModel(model),
                  }),
                  m(FlatButton, {
                    label: 'Delete',
                    iconName: 'delete',
                    className: 'right',
                    onclick: () => {
                      model.users = users.filter((u) => u.id !== user.id);
                      saveModel(model);
                    },
                  }),
                  m(
                    'a.waves-effect.waves-teal.btn-flat.right',
                    { href: `mailto:${user.email}` },
                    m('i.material-icons left', 'email'),
                    'Open email'
                  ),
                ]),
              })),
            }),
            addUser &&
              m(LayoutForm, {
                form: userForm,
                obj: newUser,
                onchange: (isValid) => {
                  canSaveUser = isValid;
                },
              }),
            m(FlatButton, {
              label: addUser ? 'Save' : 'Add User',
              disabled: addUser ? !canSaveUser : false,
              iconName: addUser ? 'save' : 'add',
              className: 'right',
              onclick: () => {
                if (addUser && canSaveUser) {
                  model.users.push(newUser);
                  model.users = model.users.sort((a, b) =>
                    a.name.split(' ').pop()!.localeCompare(b.name.split(' ').pop()!)
                  );
                  saveModel(model);
                  newUser = {} as User;
                  canSaveUser = false;
                }
                addUser = !addUser;
              },
            }),
            addUser &&
              m(FlatButton, {
                label: 'Cancel',
                iconName: 'cancel',
                className: 'right',
                onclick: () => {
                  newUser = {} as User;
                  canSaveUser = false;
                  addUser = false;
                },
              }),
          ]),
        ]),
      ];
    },
  };
};
