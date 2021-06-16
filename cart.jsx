// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Badge,
    Container,
    Row,
    Col,
    Image,
    Input,
    InputGroup,
    FormControl
  } = ReactBootstrap;

  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi("http://localhost:1337/products", { data: [], } );
  console.log(`Rendering Products ${JSON.stringify(data)}`);

  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
    
    let stock = item[0].instock - 1;
    items.find((item) => item.name == name).instock = stock;
    setItems([...items]);
  };

  const deleteCartItem = (index, item) => {
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);

    let removedItem = item;
    let stock = removedItem.instock + 1;
    items.find((item) => item.name == removedItem.name).instock = stock;
    setItems([...items]);
  };

  let list = items.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <div className="d-inline-block" style={{marginRight: ".5rem"}}>
          <Image src={url} width={50} roundedCircle></Image>
        </div>
        
        <div className="d-inline-block" style={{marginRight: ".5rem"}}>
          <Button variant="primary" size="large">
            {item.name} <Badge bg="secondary">{item.instock}</Badge>
            <span className="visually-hidden">in stock</span>
          </Button>
        </div>
        <input className="btn btn-success" name={item.name} type="submit" onClick={addToCart} value={`+ ${item.cost}$`} disabled={item.instock === 0}></input>
      </li>
    );
  });

  let cartList = cart.map((item, index) => {
    return (
      <Accordion.Item eventKey={index + 1} key={index}>
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index, item)}
          eventKey={1 + index}>
          <Accordion.Body>
            ${item.cost} from {item.country}
          </Accordion.Body>
        </Accordion.Collapse>
        
    </Accordion.Item>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    return newTotal;
  };

  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((newItem) => {
      let {name,country,cost,instock} = newItem;
      return {name,country,cost,instock};
    });
    setItems([...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none", paddingLeft: "0" }}>{list}</ul>

          <hr />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              restockProducts(query);
              console.log(`Restock called on ${query}`);
            }}
          >
            <InputGroup className="mb-3">
              <FormControl
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button variant="info" type="submit">ReStock Products</Button>
            </InputGroup>
          </form>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
