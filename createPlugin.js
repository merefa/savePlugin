awsLambdaFunctionUrl = 'https://2veprix5lhxt5w4ryyc54wy57u0feyuc.lambda-url.us-east-2.on.aws/';

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes())
    ].join(':')
  );
}

function parse_item(id) {
    const date = formatDate(new Date());
    const distributor = window.location.host.split('.')[0].toUpperCase();
    const distributor_lnk = `=HYPERLINK("https://${window.location.host}"; "${distributor}")`;
    const item_element = document.getElementById(`cart_item_row_${id}`);
    let description = item_element.getElementsByClassName('product-description')[0].innerText;
    description += '\n' + item_element.getElementsByClassName('display-price')[0].innerText;

    const price = item_element.getElementsByClassName('display-price')[1].innerText;
    const quantity = item_element.getElementsByClassName('t-numerictextbox')[0].querySelector('div > div').innerText;
    const totalPrice = item_element.getElementsByClassName('cart-item-total')[0].innerText;

    return [date, distributor_lnk, description, price, quantity, totalPrice];
}


function dump_shopcart() {
    const append_data_array = [];
    const item_ids = Object.keys(JSON.parse(document.getElementById('shoppingCartItems').value));

    for(let i = 0; i < item_ids.length; i++) {
        item = parse_item(item_ids[i]);
        append_data_array.push(item);
    }
    return append_data_array;
}

const saveButtonText = '📝 Сохранить товары в google table';
const errorButtonText = 'Случилась какая-то ошибка :(';
const successButtonText = '✅ Сохранено';
const waitButtonText = "⏳🙄 Wait, saving ...";

function handleSaveClick() {
    saveButtonElement.disabled = true;
    saveButtonElement.textContent = waitButtonText;

    const shopcart_data = dump_shopcart();
    const req_body = {
        "API_KEY": localStorage.MEREFA_AWS_API_KEY,
        "append_data": shopcart_data
    };
    if(shopcart_data) {
        if(confirm(`Добавить ${shopcart_data.length} items в таблицу заказов?`)){
            fetch(awsLambdaFunctionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(req_body),
            })
              .then((response) => {
                // Check if the response status is 200 OK
                if (!response.ok) {
                  // If it's not 200 OK, parse the JSON response for the error message
                  return response.json().then((data) => {
                    throw new Error(data.error_msg);
                  });
                }

                // If the response is 200 OK, parse the JSON response
                return response.json();
              })
              .then((data) => {
                alert(data.message);
                saveButtonElement.textContent = successButtonText;
              })
              .catch((error) => {
                saveButtonElement.textContent = errorButtonText;
                alert(`Ошибка при сохранении товара в таблицу: ${error.message}`);
              });
        } else {
            saveButtonElement.disabled = false;
            saveButtonElement.textContent = saveButtonText;
        }
    }
}

const saveButtonElement = document.createElement("button");
saveButtonElement.classList.add("button-4", "button-main-style");
saveButtonElement.textContent = saveButtonText;
saveButtonElement.onclick = handleSaveClick;
document.getElementsByClassName('cart-footer')[0].appendChild(saveButtonElement);
