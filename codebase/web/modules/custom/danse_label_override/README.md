# DANSE Label Override
This module is designed to override the default DANSE labels on a per-site basis using hook_danse_content_topic_operation_label_alter(){}

## Overview
Clone this module into your ```/web/modules/custom/``` folder.

In order to modify the labels, you will need to edit the ```danse_label_override.module``` file in this module and adjust it to suit the comment, content, and taxonomy types on your site.

I've tried to provide good documentation and comments in the code I've written. By no means will it suit your situation out of the box unless you're only targeting the Drupal Forum module, its taxonomy and content type, and forum comments (which is what I'm doing). That said, you should get a pretty clear understanding for the logic I've laid out and how to target specific pieces of content on your site.

### The Logic
The originial api example can be found in ```/web/modules/contrib/danse/modules/content/danse_content.api.php```
It was laid out in the following manner:
```php
if ($entity instanceof CommentInterface) {
    // Switch statement based on which event label you want to target (create, update, delete, publish, unpublish, comment)
    
    switch ($topic->id()) {}
} elseif (!$entityMode) {
    // If you're targeting the entity type instead of individual entities, go here

    if ($entityHasBundle) {
        // if the content is part of a bundle, go here. A bundle is a specific content type (like basic pages or book pages, etc) or taxonomy group of terms (like tags or locations)
        // NOTE: this doesn't define which bundle they're a part of, just that they're in a bundle.

    } else {
        // If the content isn't part of a bundle, go here
    }
}
```

My the danse_label_override code is structured on the same foundation but adds extra logic for deeper filtering.
This example explains certain blocks of code once and then uses elipsis (...) to indicate a duplication of logic that was previously explained.
```php
if ($entity instanceof CommentInterface) {
    // Use this section to modify DANSE labels for Comments

    if ($entityBundle == 'machine_name'){ 
        // target comments of the entity type: machine_name  (found under: Structure > Comment Types > ... )
        // Note that, like content types, you can create multiple comment types and attach them to various content types.

        if (!$entityMode) {
            // This block is for when you want to subscribe to ALL events of a type, good for Admins/Moderators
            // Some sites are providing user-level access to these buttons for things like blog or event notifications when new content is published and users want to know about everything being published on a site.

            switch ($topic->id()) {
                // When editing a content type, comment type, or taxonomy vocabulary - on the edit screen, there's a DANSE section. In that section, the admin chooses which events cause notifications and which events various roles are allowed to subscribe to. Those various event types are: Create, Update, Delete, Publish, Unpublish, Comment (CUDPUC)
                // You can adjust the label for each of the events using the cases in the switch statement

                case TopicInterface::CREATE:
                    $label = (string) t('@verb_time when a @bundle @entityType is created "@title"', $args);
                    break;
                case TopicInterface::PUBLISH:
                    $label = (string) t('@verb all responses to: "@title"', $args);
                    break;
                case ...
                ...
            }
        } else {
            // This block is for when you want to subscribe to individual comment threads/replies, good for users

            switch ($topic->id()) { ... }
        }
    }
} elseif ($entity instanceof ContentEntityInterface) {
    // This block is for targeting Content Type and Taxonomy DANSE subscription buttons 

    if ($entityType == 'node'){
        // This section lets you target content type nodes (found under: Structure > Content Types > ... )

        if ($entityBundle == 'node_machine_name'){
            // This section lets you target the node type with the machine name: node_machine_name

            if (!$entityMode) { ... }
        } else {
            // This section lets you target all other node types that have not been defined above.

            if (!$entityMode) { ... }
        }
    } elseif ($entityType == 'taxonomy_term'){
        // This section lets you target taxonomy terms (found under: Structure > Taxonomies > ... )

        if ($entityBundle == 'taxonomy_machine_name'){
            // This section lets you target taxonomy terms with the machine name: taxonomy_machine_name
            
            if (!$entityMode) { ... }
        } else {
            // This section targets all other taxonomy terms that have not been defined above.
            
            if (!$entityMode) { ... }
        }
    } else {
        // Not sure what this would cover, but for any other entity types out there, this would cover them.

        switch ($topic->id()) { ... }
    }


} elseif (!$entityMode) {
    // If you're targeting the entity instead of individual nodes, go here

    if ($entityHasBundle) {
        // if the content is part of a bundle, go here. A bundle is a specific content type (like basic pages or book pages, etc) or taxonomy group of terms (like tags or locations)
        // NOTE: this doesn't define which bundle they're a part of, just that they're in a bundle.

        switch ($topic->id()) { ... }
    } else {
        // If the content isn't part of a bundle, go here

        switch ($topic->id()) { ... }
    }
}
```

### Additional Variables & Arguments
I have also added some additional arguments to help with filtering and targeting specific content.

#### Variables
These variables allow us to target by the type of entity, the bundle, and the entity ID if you prefer to sort that way rather than by the machine name.
```php
    /** @var string $entityType */
    $entityType = $entity->getEntityTypeId();
    /** @var string $entityBundle */
    $entityBundle = $entity->bundle();
    /** @var int $entityId */
    $entityId = $entity->id();
```
#### Arguments
These arguments provide additional linguistic syntax and testing features to help us create new, more targeted labels as we learn how the module works:
```php
    // The @verb argument comes with the module
    $args['@verb'] = $subscribeMode ? (string) t('Subscribe to') : (string) t('Unsubscribe from');

    // The @verb_time adds a variation I prefer for Create, Delete, and Unpublish events
    $args['@verb_time'] = $subscribeMode ? (string) t('Get notified when') : (string) t('Unsubscribe when');

    // The following arguments are more to help you troubleshoot if you need to temporarily echo the Entity Type, Bundle, or ID into a label to see what it is a part of.
    //Provide a variable to get the entity bundle, found in /web/core/lib/Drupal/Core/Entity/EntityBase.php
    $args['@entityType'] = $entity->getEntityTypeId();
    $args['@bundle'] = $entity->bundle();
    $args['@entityId'] = $entity->id();
    // I like to include them at the end of a label as: || et: @entityType | b: @bundle | id: @entityId
```

## Additional Troubleshooting Pro-Tip
The logic above and in the .module file should be enough to help you understand where a particular label is coming from, but it can still be confusing some times. Here are some pro-tips to help you with troubleshooting and finding where in the code a particular label is coming from:
1. Check your settings in the Edit screen. Start by making sure the label you're looking at is for a node, taxonomy, or comment. Then go to that entity's Edit screen and double check the role subscription settings at the bottom of the DANSE section. Remember that there's one row for entity-wide subscriptions and another for node-level subscriptions. Write down/or remember which you've selected/allowed.
2. Follow the logical waterfall to find your block of code. Example: I'm finding a... node - that I have made an IF section for by targeting its machine name - and I'm finding the label for the node-level action - and I want the PUBLISH event
3. When All else fails, add numbers to the labels. I don't recommend line numbers because they may change as you add new sections, but they can still work. I just had to keep fixing mine. A more arbitrary unique identification system might be less frustrating. Maybe a short syntax for NODE-node-type-number/event.


## FAQ
**What about translations?**

The DANSE Developers are smart and I'm assuming what they've provided in the example api file and what I've duplicated from their code will be translatable by Drupal. I have not provided a method for testing the site's language and adjusting for that in my code. My site currently only cares about English and what I've provided here is what I've had time to develop. 
I'm sure with a little research, there will be something in the $context that helps target translations. As the developers note though, with over 190 languages available and six available subscription options, trying to provide customized labels for every language is a test in patience and perserverance.

At the time of this writing, this hook is brand new and the developers want to get some user data before implementing a UI interface for this DANSE feature, so the hook is what we have. THANK YOU DANSE DEVELOPERS!

## DISCLAIMER
I am not a professional developer, I don't even play one on the internet. This is what I scratched together in a day just to see if it would work. This module shouldn't do anything other than implement the alter_hook from:
```/web/modules/contrib/danse/modules/content/danse_content.api.php```

This module was created on 2/9/2021 for DANSE version 2.2.dev. DANSE may have been upgraded since the creation of this module. I make no promises to keep this updated, so use it as a template, but you may have to do your own thinking. 
