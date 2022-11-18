# LODA-RUST - mine

## Life cycle

Over time the state alternates between `Mine` and `Postmine`.

<table>
  <tr>
    <td>0</td>
    <td>Mine</td>
    <td><img src="miner_workers.jpg" alt="3 miner workers running" style="width:200px;"/></td>
    <td>Mining in parallel with 3 workers.<br><br>Accumulate until 10 candidate programs have been found.</td>
  </tr>
  <tr>
    <td>1</td>
    <td>Postmine</td>
    <td><img src="postmine_upload0.jpg" alt="postmine, didn't discover anything" style="width:200px;"/></td>
    <td>Checking the candidate programs.<br><br>Bottleneck: Only 1 worker. Ideally this should run parallel.<br><br><b>Didn't discover any programs.</b></td>
  </tr>
  <tr>
    <td>2</td>
    <td>Mine</td>
    <td><img src="miner_workers.jpg" alt="3 miner workers running" style="width:200px;"/></td>
    <td>Running the mining phase again until there are sufficiently many candidate programs.</td>
  </tr>
  <tr>
    <td>3</td>
    <td>Postmine</td>
    <td><img src="postmine_upload1_a.jpg" alt="postmine, discovering 1 program" style="width:200px;"/></td>
    <td>Checking the candidate programs.<br><br><b>Discovered 1 program and uploaded it to the server.</b></td>
  </tr>
  <tr>
    <td>4</td>
    <td>Mine</td>
    <td><img src="miner_workers.jpg" alt="3 miner workers running" style="width:200px;"/></td>
    <td></td>
  </tr>
  <tr>
    <td>5</td>
    <td>Postmine</td>
    <td><img src="postmine_upload2_b.jpg" alt="postmine, discovering 2 programs" style="width:200px;"/></td>
    <td><b>Discovered 2 programs and uploaded them to the server.</b></td>
  </tr>
  <tr>
    <td>6</td>
    <td>Mine</td>
    <td><img src="miner_workers.jpg" alt="3 miner workers running" style="width:200px;"/></td>
    <td></td>
  </tr>
  <tr>
    <td>7</td>
    <td>Postmine</td>
    <td><img src="postmine_upload3_a.jpg" alt="postmine, discovering 3 programs" style="width:200px;"/></td>
    <td><b>Discovered 3 programs and uploaded them to the server.</b><br><br>It's incredibly rare to discover so many.</td>
  </tr>
  <tr>
    <td>8</td>
    <td>Mine</td>
    <td><img src="miner_workers.jpg" alt="3 miner workers running" style="width:200px;"/></td>
    <td></td>
  </tr>
  <tr>
    <td>9</td>
    <td>Postmine</td>
    <td><img src="postmine_upload2_a.jpg" alt="postmine, discovering 2 programs" style="width:200px;"/></td>
    <td><b>Discovered 2 programs and uploaded them to the server.</b></td>
  </tr>
  <tr>
    <td>10</td>
    <td>Mine</td>
    <td><img src="miner_workers.jpg" alt="3 miner workers running" style="width:200px;"/></td>
    <td></td>
  </tr>
  <tr>
    <td>11</td>
    <td>Postmine</td>
    <td><img src="postmine_upload0.jpg" alt="postmine, didn't discover anything" style="width:200px;"/></td>
    <td><b>Didn't discover any programs.</b><br><br>This is the case most of the time.</td>
  </tr>
</table>

---

## Initialization

<img src="initial_state.jpg" alt="initial state" style="width:400px;"/>

---

## Reload analytics

<img src="reload_analytics.jpg" alt="reload analytics" style="width:400px;"/>

