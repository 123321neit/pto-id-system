import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  mockObjectCards,
  mockRecentDocuments,
  type MockDashboardPanel,
  type MockObjectCard,
} from './mock-dashboard.js';

import { objectPath } from './app-route-paths.js';
import { CertificateLibraryPage } from './CertificateLibraryPage.js';
import { RepresentativesOrganizationsPage } from './RepresentativesOrganizationsPage.js';

interface MockObjectDashboardPageProps {
  readonly activePanel: MockDashboardPanel;
}

export function MockObjectDashboardPage({
  activePanel,
}: MockObjectDashboardPageProps): React.JSX.Element {
  const [objectSearch, setObjectSearch] = useState('');
  const filteredObjects = filterObjects(mockObjectCards, objectSearch);

  return (
    <main className="app-shell">
      <aside className="app-sidebar" aria-label="Навигация демо-приложения">
        <div className="app-sidebar__brand">
          <span className="app-sidebar__logo" aria-hidden="true">
            ИД
          </span>
          <span>
            <strong>ИДея</strong>
            <small>Рабочее место ПТО</small>
          </span>
        </div>

        <nav className="app-sidebar__nav" aria-label="Основная навигация">
          <Link aria-current={activePanel === 'objects' ? 'page' : undefined} to="/objects">
            <span aria-hidden="true">□</span>
            Объекты
          </Link>
          <Link
            aria-current={activePanel === 'certificates' ? 'page' : undefined}
            to="/certificates"
          >
            <span aria-hidden="true">◇</span>
            Библиотека сертификатов
          </Link>
          <Link
            aria-current={activePanel === 'representatives' ? 'page' : undefined}
            to="/organizations"
          >
            <span aria-hidden="true">△</span>
            Представители и организации
          </Link>
          <button aria-label="Настройки скоро" disabled type="button">
            <span aria-hidden="true">○</span>
            Настройки · скоро
          </button>
        </nav>

        <div className="app-sidebar__account">
          <span className="app-sidebar__avatar" aria-hidden="true">
            И
          </span>
          <span>
            <strong>ПТО</strong>
            <small>Иванов И.И.</small>
          </span>
        </div>
      </aside>

      {activePanel === 'objects' ? (
        <section className="dashboard-page" aria-labelledby="objects-dashboard-title">
          <div className="dashboard-content">
            <header className="dashboard-hero">
              <div>
                <p className="section-kicker">ИДея</p>
                <h1 id="objects-dashboard-title">
                  ИДея — рабочее место ПТО для исполнительной документации
                </h1>
                <p>Акты, реестры, сертификаты и комплекты ИД в одном рабочем месте.</p>
              </div>
              <button className="primary-action" type="button">
                + Новый объект
              </button>
            </header>

            <label className="dashboard-search">
              Поиск по объектам
              <input
                aria-label="Поиск по объектам"
                onChange={(event) => {
                  setObjectSearch(event.currentTarget.value);
                }}
                placeholder="Название, адрес или статус"
                value={objectSearch}
              />
            </label>

            <div className="dashboard-layout">
              <section className="object-list" aria-label="Список объектов">
                {filteredObjects.length > 0 ? (
                  filteredObjects.map((object) => <ObjectCard key={object.id} object={object} />)
                ) : (
                  <p className="empty-state">
                    В приложении «ИДея» по такому запросу объекты не найдены.
                  </p>
                )}
              </section>

              <aside className="dashboard-side" aria-label="Быстрые разделы">
                <section className="quick-access" aria-labelledby="quick-access-title">
                  <h2 id="quick-access-title">Быстрый доступ</h2>
                  <Link className="quick-access-card" to="/certificates">
                    <span className="quick-access-card__icon" aria-hidden="true">
                      ◇
                    </span>
                    <span className="quick-access-card__text">
                      <strong>Библиотека сертификатов</strong>
                      <small>Материалы и документы качества</small>
                    </span>
                  </Link>
                  <Link className="quick-access-card" to="/organizations">
                    <span className="quick-access-card__icon" aria-hidden="true">
                      △
                    </span>
                    <span className="quick-access-card__text">
                      <strong>Представители и организации</strong>
                      <small>Подписанты и объектовые участники</small>
                    </span>
                  </Link>
                </section>

                <section className="recent-documents" aria-labelledby="recent-documents-title">
                  <h2 id="recent-documents-title">Недавние документы</h2>
                  <ul>
                    {mockRecentDocuments.map((document) => (
                      <li key={document.id}>
                        <span aria-hidden="true">□</span>
                        <span>
                          <strong>{document.title}</strong>
                          <small>
                            {document.objectTitle} / {document.updatedAtLabel}
                          </small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          </div>
        </section>
      ) : activePanel === 'certificates' ? (
        <CertificateLibraryPage />
      ) : (
        <RepresentativesOrganizationsPage />
      )}
    </main>
  );
}

interface ObjectCardProps {
  readonly object: MockObjectCard;
}

function ObjectCard({ object }: ObjectCardProps): React.JSX.Element {
  return (
    <article className="object-card">
      <div className="object-card__thumb" aria-hidden="true">
        {object.title.slice(0, 2)}
      </div>
      <div className="object-card__body">
        <div className="object-card__title-row">
          <span>
            <h2>{object.title}</h2>
            <p>{object.address}</p>
          </span>
          <span className={`status-chip status-chip--${object.status}`}>{object.statusLabel}</span>
        </div>
        <p className="object-card__summary">{object.summary}</p>
        <dl className="object-card__stats" aria-label={`Показатели объекта ${object.title}`}>
          <div>
            <dt>Документы</dt>
            <dd>{object.documentsCount}</dd>
          </div>
          <div>
            <dt>АОСР</dt>
            <dd>{object.aosrCount}</dd>
          </div>
          <div>
            <dt>Обновлен</dt>
            <dd>{object.updatedAtLabel}</dd>
          </div>
        </dl>
      </div>
      <Link className="object-card__action" to={objectPath(object.id)}>
        Открыть объект
      </Link>
    </article>
  );
}

function filterObjects(
  objects: readonly MockObjectCard[],
  search: string,
): readonly MockObjectCard[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

  if (normalizedSearch === '') {
    return objects;
  }

  return objects.filter((object) =>
    [object.title, object.address, object.statusLabel, object.summary, object.updatedAtLabel].some(
      (value) => value.toLocaleLowerCase('ru-RU').includes(normalizedSearch),
    ),
  );
}
