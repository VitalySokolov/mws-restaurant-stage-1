const restaurantName = 'restaurant';

/**
 * Common database helper functions.
 */
class DBHelper {
  // constructor() {
  //   this.dbPromise = idb.open('restaurant-store', 1, upgradeDb => {
  //     const restaurantDb = upgradeDb.createObjectStore(restaurantName, {keyPath: 'id'});
  //     restaurantDb.createIndex('neighborhood', 'neighborhood');
  //     restaurantDb.createIndex('cuisine', 'cuisine_type');
  //   });
  // }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static databaseUrl() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  };

  static dbPromise() {
    return idb.open('restaurant-store', 1, upgradeDb => {
      const restaurantDb = upgradeDb.createObjectStore(restaurantName, {keyPath: 'id'});
      restaurantDb.createIndex('neighborhood', 'neighborhood');
      restaurantDb.createIndex('cuisine', 'cuisine_type');
    });
  }

  static init(callback) {
    fetch(DBHelper.databaseUrl())
      .then((response) => response.json())
      .then((data) => {
        return DBHelper.dbPromise().then((db) => {
          const tx = db.transaction(restaurantName, 'readwrite');
          const restaurantStore = tx.objectStore(restaurantName);
          data.forEach((restaurant) => {
            restaurantStore.put(restaurant);
          });
          return tx.complete;
        })
      })
      .then(callback)
      .catch((error) => {
        callback();
      });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    return DBHelper.dbPromise().then((db) => {
      return db.transaction(restaurantName)
        .objectStore(restaurantName)
        .getAll();
    })
      .then((restaurants) => {
        callback(null, restaurants);
      })
      .catch((error) => callback(error, null))
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    return DBHelper.dbPromise().then((db) => {
      return db.transaction(restaurantName)
        .objectStore(restaurantName)
        .get(+id);
    })
      .then((restaurant) => {
        callback(null, restaurant);
      })
      .catch(() => callback('Restaurant does not exist', null))
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    return DBHelper.dbPromise().then((db) => {
      return db.transaction(restaurantName)
        .objectStore(restaurantName)
        .index('cuisine')
        .getAll();
    })
      .then((restaurant) => {
        callback(null, restaurant);
      })
      .catch((error) => callback(error, null))
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    return DBHelper.dbPromise().then((db) => {
      return db.transaction(restaurantName)
        .objectStore(restaurantName)
        .index('neighborhood')
        .getAll();
    })
      .then((restaurant) => {
        callback(null, restaurant);
      })
      .catch((error) => callback(error, null))
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static smallImageUrlForRestaurant(restaurant) {
    const imageFileName = restaurant.photograph || restaurant.id;
    return (`/img/${imageFileName}_small.jpg`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    const imageFileName = restaurant.photograph || restaurant.id;
    return (`/img/${imageFileName}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
}
