import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import "./styles.css";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [image, setImage] = useState("https://via.placeholder.com/600/92c952");
  const [imageIndex, setImageIndex] = useState(1);

  useEffect(() => {
    //Cada vez que se da click al botón se realiza el request de una imagen nueva, única y diferente, se realiza así para no guardar todas las imágenes innecesariamente, debido a que no se ocuparán todas
    const getImage = async () => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/photos/${imageIndex}`
      );
      const data = await res.json();
      setImage(data.url);
    };
    getImage();
  }, [imageIndex]);

  const addMoveable = () => {
    //cada click aumenta en 1 el contador para realizar un request de una nueva imágen
    if (imageIndex < 5000) {
      setImageIndex((prev) => prev + 1);
    } else {
      //al llegar a 5000 se vuelve a empezar, debido a que la API solo tiene 5000 elementos
      setImageIndex(1);
    }
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    // Se crea un nuevo arreglo de los diferentes tipos de fit para la imágen
    const FIT = ["fill", "contain", "cover", "scale-down"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        objectFit: FIT[Math.floor(Math.random() * FIT.length)],
        updateEnd: true,
        image,
      },
    ]);
  };

  //Al seleccionar un objeto se elimina de la lista de objetos existentes
  const deleteMoveable = (id) => {
    if (selected) {
      const deletedMoveables = moveableComponents.filter(
        (moveable) => moveable.id !== selected
      );
      setMoveableComponents(deletedMoveables);
      setSelected(null);
    }
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  //El botón de Borrar solamente aparece cuando está seleccionado algún componente para borrarlo
  const DeleteButton = () =>
    selected ? (
      <button className="button-2" onClick={deleteMoveable}>
        Delete Moveable
      </button>
    ) : null;

  return (
    <main style={{ height: "90vh", width: "90vw" }}>
      <div
        style={{
          paddingBottom: "5px",
        }}
      >
        <button className="button-1" onClick={addMoveable}>
          Add Moveable
        </button>
        <DeleteButton />
      </div>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  image,
  imageIndex,
  objectFit,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
    image,
    imageIndex,
    objectFit,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const handleResizeStart = async (e) => {
    console.log("e", e);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right
    let initialLeft = e.clientX;
    let initialWidth = e.width;
    let initialTop = e.clientY;
    let initialHeight = e.height;
    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosY === -1) {
      // Save the initial left and width values of the moveable component
      initialTop = top - e.dragStart.offsetY;
    } else {
      initialTop = top;
    }
    if (handlePosX === -1) {
      // Save the initial left and width values of the moveable component
      initialLeft = left - e.dragStart.offsetX;
    } else {
      initialLeft = left;
    }
    // Set up the onResize event handler to update the left value based on the change in width
  };

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;

    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      image,
      imageIndex,
      objectFit,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;

    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(
      id,
      {
        top: top,
        left: left,
        width: newWidth,
        height: newHeight,
        color,
        image,
        imageIndex,
        objectFit,
      },
      true
    );
  };
  const onDrag = (e) => {
    let top = e.top;
    let left = e.left;

    updateMoveable(id, {
      top,
      left,
      width,
      height,
      color,
      image,
      imageIndex,
      objectFit,
    });
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      >
        <img
          src={image}
          alt={imageIndex}
          width={width}
          height={height}
          style={{
            objectFit,
          }}
        />
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={onDrag}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        bounds={{
          left: 0,
          top: 0,
          right: parent.offsetWidth,
          bottom: parent.offsetHeight,
        }}
        snappable
      />
    </>
  );
};
