// button = document.getElementById('submit-btn');
drawVisualization(getModelParams().x, getModelParams().y, getModelParams().r);

async function drawAndFetch() {
  const modelParams = getModelParams();
  try {
    validate(modelParams.x, modelParams.y, modelParams.r);
  } catch (e) {
    if (e instanceof ValidationError) {
      console.log(e);
      alert(`Validation failed: ${e.message}`);
    } else {
      console.log(e);
      alert(`Error: ${e.message}`);
    }
    return;
  }
  drawVisualization(modelParams.x, modelParams.y, modelParams.r);
  await fetchQuerry(modelParams);
}

function getModelParams() {
  const params = {
    x: parseFloat(_getSelectedRadioValue("xRadio")),
    y: parseFloat(document.getElementById("yInput").value),
    r: parseFloat(document.getElementById("rInput").value)
  };
  console.log(`Cur modelParams: x${params.x} y${params.y} r${params.r}`);
  return params;
}

function _getSelectedRadioValue(radioName) {
  const radioButtons = document.querySelectorAll(
    `input[type="radio"][name="${radioName}"]`
  );

  for (const radioButton of radioButtons) {
    if (radioButton.checked) {
      return radioButton.value;
    }
  }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('submit-btn');
  if (button) {
    button.addEventListener('click', drawAndFetch);
  }
});
