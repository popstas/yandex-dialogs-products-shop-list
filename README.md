# yandex-dialogs-products-shop-list

[![Build Status](https://travis-ci.org/popstas/yandex-dialogs-products-shop-list.svg?branch=master)](https://travis-ci.org/popstas/yandex-dialogs-products-shop-list)

Навык для ведения списка покупок.
Общая память для всех ваших устройств.

По умолчанию запускается на \*:2758

# Использование

- добавь в список покупок сыр
- в магазине надо купить белый хлеб и молоко
- надо купить сметану
- удали сметану из списка
- список покупок
- что купить в магазине
- плюс мандарины минус бананы плюс шоколад (идея взята [здесь](https://dialogs.yandex.ru/store/skills/19170605-golosovoj-spisok-plyus-minus))

Навык сделан так, чтобы вписаться в сценарий: на кухне стоит мини-колонка, через нее легко добавлять продукты в список покупок. Колонка связана со смартфоном, на нем можно смотреть список в магазине.

## Команды:

- Добавляйте покупки в список покупок
- Скажите "команды", чтобы посмотреть примеры
- Можно удалить последний ответ, сказав "удали/забудь последнее"
- Свяжите несколько устройств, скажите "скажи код", произнесите код на подключаемом устройства
- Можно просить повторить: "повтори" или "что ты услышала"

## Технические особенности

- Сделано на [yandex-dialogs-sdk](https://github.com/fletcherist/yandex-dialogs-sdk), используются commands, scenes, matchers, middlewares из SDK
- Выбор хранилища между MongoDB и Loki (локальное файловое хранилище)
- Выбор сценария на основе простого морфологического разбора с az.js
- Система тестирования на основе [сценариев](/static/scenarios.yml), работает на [yandex-dialogs-client](https://github.com/popstas/yandex-dialogs-client) и на [travis](https://travis-ci.org/popstas/yandex-dialogs-products-shop-list)
- Модульность команд (подробнее в CONTRIBUTING.md), главный файл навыка состоит только из подключений middlewares и commands
- Метрики передаются в [chatbase](https://github.com/popstas/yandex-dialogs-sdk-chatbase), с полной разметкой intents и в Яндекс.Метрику
- Лог запросов и ответов с id юзеров, номером визита и номером сообщения в визите
- Корректировка типичных неправильных ударений
- Упрощенное указание эффектов: `[megaphone]говорите громче!` вместо `<speaker effect="megaphone">говорите громче!`
- Возможность указывать некоторую фонетическую разметку в text, а не в tts

## Особенности диалога

- Умеет отвечать на типичные фразы: приветствие, благодарность, оскорбление
- Обучающий тур при первом заходе
- Необязательные подтверждения (скажите `да`, `нет` или другую команду)
- Знает свою версию (`версия`) и умеет говорить итеративную историю изменений (`что нового`)
- Умеет повторять последний ответ или вопрос (`повтори`)
- Различает новых юзеров и повторных
- Знает некоторые вещи, на которые она понимает, что не знает ответ
- Умеет связывать несколько устройств, чтобы все они помнили одно и то же

### Проблемные фразы:

- добавь кока колу селедку под шубой чай christmas mystery батон нарезной чупа чупс и майонез провансаль
- купить масло 200 грамм

- сотри его

- удались из списка сок
- рыбу купил

- все спасибо

- ты тормоз

- как дела
- так
- не понимаю (некоторые юзеры признаются, что разговор не удается)
- не поняла

